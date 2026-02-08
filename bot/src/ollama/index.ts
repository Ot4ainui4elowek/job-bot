// src/ollama/parser.ts
import ollama from 'ollama'
import { SearchFilters } from '../api/hh.ru/types'
require('dotenv').config()

const MODEL = 'qwen3-vl:4b' // твоя модель Ollama

export async function parseUserToFilters(
	userText: string
): Promise<SearchFilters> {
	const prompt = `
Пользователь описывает вакансию, которую хочет найти на hh.ru. Преобразуй это сообщение в JSON с полями:
- text — строка для поиска;
- area — id региона, если указан город;
- salary — минимальная зарплата, если упомянута;
- experience — одна или несколько опций: ${JSON.stringify([
		'noExperience',
		'between1And3',
		'between3And6',
		'moreThan6',
	])};
- employment — одна или несколько опций: ${JSON.stringify([
		'full',
		'part',
		'project',
		'volunteer',
		'probation',
	])};
- schedule — одна или несколько опций: ${JSON.stringify([
		'fullDay',
		'shift',
		'flexible',
		'remote',
		'flyInFlyOut',
	])}.

Если что-то не ясно — ставь null.

Фраза пользователя: "${userText}"
`

	const message = { role: 'user', content: prompt }
	console.log('GET FILTERS (streaming)...')

	let fullContent = ''

	try {
		const stream = await ollama.chat({
			model: process.env.MODEL || 'qwen3-vl:4b', // модель на локальном Ollama
			messages: [message],
			stream: true, // включаем стрим
		})

		for await (const part of stream) {
			process.stdout.write(part.message?.content || '')
			fullContent += part.message?.content || ''
		}

		console.log('\nFILTERS SUCCESS')

		const json = JSON.parse(fullContent)
		return json as SearchFilters
	} catch (err) {
		console.error('Ошибка парсинга JSON от Ollama:', err)
		return {} as SearchFilters
	}
}
