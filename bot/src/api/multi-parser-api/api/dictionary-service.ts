import { pipeline } from '@xenova/transformers'
import fs from 'fs'
import cron from 'node-cron'
import path from 'path'
import { ParserStrategy } from '../../agregator/constants/strategy'
import {
	IDictionarySearchArgs,
	IParserDictionaries,
	IParserDictionary,
} from '../types/dictionaries'
import { MultiParserApi } from './api'

interface EmbeddingEntry {
	embedding: number[]
	item: IParserDictionary
}

interface SemanticCacheData {
	timestamp: number
	embeddings: Record<ParserStrategy, EmbeddingEntry[]>
	model: string
}

export class ParserDictionariesCache {
	private static instance: ParserDictionariesCache | null = null

	private CACHE_FILE = path.join(__dirname, 'dictionary_cache.json')
	private SEMANTIC_CACHE_FILE = path.join(__dirname, 'semantic_cache.json')
	private MODEL_NAME = 'Xenova/e5-small-v2'

	private extractor: any = null
	private semanticIndex: Map<ParserStrategy, EmbeddingEntry[]> = new Map()

	private static quickExtractor: any = null

	private constructor(private readonly parserApi: MultiParserApi) {}

	public static getInstance(
		parserApi: MultiParserApi,
	): ParserDictionariesCache {
		if (!ParserDictionariesCache.instance) {
			ParserDictionariesCache.instance = new ParserDictionariesCache(parserApi)
			ParserDictionariesCache.instance.init()
		}
		return ParserDictionariesCache.instance
	}

	private async init() {
		console.log('[DICTIONARIES]: INIT')

		this.extractor = await pipeline('feature-extraction', this.MODEL_NAME)
		await this.updateCache()
		this.scheduleDailyUpdate()
	}

	private async updateCache() {
		const res = await this.parserApi.getDictionaries()
		if (!res) {
			console.error('[DICTIONARIES]: Failed to fetch dictionaries')
			return
		}

		const data = res as IParserDictionaries

		fs.writeFileSync(
			this.CACHE_FILE,
			JSON.stringify({ timestamp: Date.now(), json: data }, null, 2),
		)

		await this.updateSemanticCache(data)
	}

	private async updateSemanticCache(dictionaries: IParserDictionaries) {
		const embeddings: Record<ParserStrategy, EmbeddingEntry[]> = {} as any

		for (const [source, items] of Object.entries(dictionaries.data)) {
			const list: EmbeddingEntry[] = []

			for (const item of items as IParserDictionary[]) {
				const text = `passage: ${item.profession}`
				const embedding = await this.getEmbedding(text)
				list.push({ embedding, item })
			}

			embeddings[source as ParserStrategy] = list
			this.semanticIndex.set(source as ParserStrategy, list)
		}

		fs.writeFileSync(
			this.SEMANTIC_CACHE_FILE,
			JSON.stringify(
				{ timestamp: Date.now(), embeddings, model: this.MODEL_NAME },
				null,
				2,
			),
		)
	}

	private async getEmbedding(text: string): Promise<number[]> {
		const output = await this.extractor(text, {
			pooling: 'mean',
			normalize: true,
		})
		return Array.from(output.data)
	}

	private static cosineSimilarity(a: number[], b: number[]): number {
		return a.reduce((sum, v, i) => sum + v * b[i], 0)
	}

	private normalize(text: string) {
		return text.toLowerCase().replace(/ё/g, 'е').trim()
	}

	private scheduleDailyUpdate() {
		cron.schedule('26 18 * * *', () => this.updateCache())
	}

	public static getCache(source: ParserStrategy): IParserDictionary[] | null {
		if (!fs.existsSync(path.join(__dirname, 'dictionary_cache.json')))
			return null
		const stored = JSON.parse(
			fs.readFileSync(path.join(__dirname, 'dictionary_cache.json'), 'utf8'),
		)
		return stored.json.data[source]
	}

	// ================= HYBRID SEARCH =================

	public static async quickSemanticSearch({
		source,
		query,
		topK = 5,
	}: IDictionarySearchArgs): Promise<IParserDictionary[] | null> {
		const cache = ParserDictionariesCache.getCache(source)
		if (!cache) return null

		const normalize = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim()

		// 1️⃣ STRICT TEXT MATCH
		const textMatches = cache.filter(item =>
			normalize(item.profession).includes(normalize(query)),
		)

		if (textMatches.length) {
			return textMatches.slice(0, topK)
		}

		// 2️⃣ SEMANTIC FALLBACK
		const fileName = path.join(__dirname, 'semantic_cache.json')
		if (!fs.existsSync(fileName)) return cache.slice(0, topK)

		const stored: SemanticCacheData = JSON.parse(
			fs.readFileSync(fileName, 'utf8'),
		)

		const sourceEmbeddings = stored.embeddings[source]
		if (!sourceEmbeddings) return null

		if (!ParserDictionariesCache.quickExtractor) {
			ParserDictionariesCache.quickExtractor = await pipeline(
				'feature-extraction',
				stored.model,
			)
		}

		const output = await ParserDictionariesCache.quickExtractor(
			`query: ${query}`,
			{
				pooling: 'mean',
				normalize: true,
			},
		)

		const queryEmbedding = Array.from(output.data) as number[]
		const MIN_SCORE = 0.65

		return sourceEmbeddings
			.map(({ embedding, item }) => ({
				item,
				score: ParserDictionariesCache.cosineSimilarity(
					queryEmbedding,
					embedding,
				),
			}))
			.filter(r => r.score >= MIN_SCORE)
			.sort((a, b) => b.score - a.score)
			.slice(0, topK)
			.map(r => r.item)
	}
}
