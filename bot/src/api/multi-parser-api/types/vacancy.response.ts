import { IParserVacancy } from './vacancy'

export interface IParserVacancyResponse {
	success: boolean
	data: IParserVacancy[]
	meta: Meta
}
type DataSource = 'cache' | 'fresh'

export interface Meta {
	total: number
	totalPages: number
	currentPage: number
	limit: number
	source: DataSource
	lastUpdate: string
	updating: boolean
	category?: string
}
