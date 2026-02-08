import { ParserStrategy } from '../../agregator/constants/strategy'

export interface IParserDictionaries {
	success: boolean
	data: IParserDictionariesData
}
export interface IParserDictionariesData {
	'999.md': IParserDictionary[]
	'makler.md': IParserDictionary[]
	'rabota.md': IParserDictionary[]
}

export interface IParserDictionary {
	id: string
	source: string
	profession: string
	professionId?: string | null
	category?: string | null
	synonyms: string[]
	vacancyCount?: number | null
	lastCheckedAt?: Date | null
	createdAt: Date
	updatedAt: Date
}

export interface IDictionarySearchArgs {
	source: ParserStrategy
	query: string
	topK: number
}
