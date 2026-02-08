import { Salary } from '../../../commands/filters/edit-salary'
import { VacancySearchFieldsId } from '../../hh.ru/constants/dictionary'
import {
	Currency,
	EmploymentType,
	Experience,
	ScheduleType,
} from './filters-dictionary'
import { LocationType, SerchingType } from './parser'

export const filters = {
	// area: '📍 Регион',
	salary: '💰 Зарплата',
	experience: '📊 Опыт работы',
	employment: '💼 Тип занятости',
	// currency: '💵 Валюта',
	// schedule: '📅 График работы',
	per_page: '📃 Количество на странице',
	back: '⬅️ На главную',
	delete: '❌ СБРОСИТЬ ФИЛЬТРЫ',
} as const

export type FilterType = (typeof filters)[keyof typeof filters]

// Маппинг ключа фильтра на тип значения из SearchFilters
export interface SearchFilters {
	keywords?: string
	locations?: string
	salaryMin?: number
	schedule?: ScheduleType
	sources?: string // Несколько источников
	useSemanticSearch?: boolean // Семантический поиск
	searchBy?: SerchingType // Новый параметр: поиск по названию или категории
	locationType?: LocationType // Новый параметр: локация (Молдова/за границей), поддержка 'aboard'
	userId?: number // ID пользователя для кэширования (для бота)
	limit?: number
	page?: number // Номер страницы (начиная с 1)

	area?: string
	salary?: Salary
	experience?: Experience
	employment?: EmploymentType
	currency?: Currency
	per_page?: number
	search_field?: VacancySearchFieldsId[]
	// … можно продолжить для других фильтров
}

// export type FilterKeyToValueType = {
// 	area: SearchFilters['area']
// 	salary: SearchFilters['salary']
// 	experience: SearchFilters['experience']
// 	employment: SearchFilters['employment']
// 	currency: SearchFilters['currency']
// 	schedule: SearchFilters['schedule']
// 	per_page: SearchFilters['per_page']
// }

// export type GetFilterValue<K extends keyof typeof filters> =
// 	FilterKeyToValueType[K]

// export type SetFilterFn = <K extends keyof typeof filters>(
// 	key: K,
// 	value: GetFilterValue<K>,
// ) => void

// export type SetFilterReturningFiltersFn = <K extends keyof typeof filters>(
// 	key: K,
// 	value: GetFilterValue<K>,
// ) => Partial<SearchFilters>
