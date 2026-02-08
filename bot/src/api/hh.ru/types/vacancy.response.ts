import { IHHVacancy } from './vacancy.interface'

export interface IHHVacancyResponse {
	items: IHHVacancy[]
	page: number
	per_page: number
	pages: number
	found: number
}
