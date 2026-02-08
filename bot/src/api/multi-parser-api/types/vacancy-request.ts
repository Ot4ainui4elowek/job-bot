import { LocationType, SerchingType } from './parser'

export interface VacancyQuery {
	keywords?: string
	locations?: string
	salaryMin?: number
	experience?: string
	schedule?: string
	source?: string // ОДИН источник (новое)
	sources?: string // Несколько источников
	useSemanticSearch?: boolean // Семантический поиск
	searchBy?: SerchingType // Новый параметр: поиск по названию или категории
	locationType?: LocationType // Новый параметр: локация (Молдова/за границей), поддержка 'aboard'
	userId?: string // ID пользователя для кэширования (для бота)
	limit?: number
	page?: number // Номер страницы (начиная с 1)
}
