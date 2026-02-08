import { Context } from 'telegraf'
import { IHHVacancy, SearchFilters } from '../api/hh.ru/types'
import { AreaLocation } from '../api/hh.ru/types/region.interface'

export interface SessionData {
	isLoading: boolean
	userId?: number
	waitingForVacancy: boolean
	waitingForSpeciality: boolean
	filters: Partial<SearchFilters>
	lastSearchResults: IHHVacancy[] // убираем Partial, массив может быть пустым
	lastSearchPage: number // убираем Partial, используем 0 как дефолт
	maxSearchPage: number | undefined // оставляем как есть или number
	savedVacancies: IHHVacancy[] // убираем Partial
	vacancyQuery: string
	awaitingFilter?: string // вместо keyof typeof filters
	searchResults?: AreaLocation[]
	commandFlowMessages?: number[]
	currentCategoryPage?: number
	lastBotMessageId?: number
}
export interface IBotContext extends Context {
	session: SessionData
}
