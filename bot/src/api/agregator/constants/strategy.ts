export const $parserStrategy = {
	rabotaMd: 'rabota.md',
	tripleNine: '999.md',
	makler: 'makler.md',
} as const

export type ParserStrategy =
	(typeof $parserStrategy)[keyof typeof $parserStrategy]

export const $agregatorStrategy = {
	HH: 'hh.ru',
	...$parserStrategy,
} as const

export type AgregatorStrategyType =
	(typeof $agregatorStrategy)[keyof typeof $agregatorStrategy]
