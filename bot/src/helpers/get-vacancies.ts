import { SearchFilters } from '../api/hh.ru/types'
import { $parserApi } from '../api/multi-parser-api/api/api'
import { IParserVacancyResponse } from '../api/multi-parser-api/types/vacancy.response'

export class VacancyService {
	constructor() {}

	/**
	 * Получение вакансий по фильтрам
	 */
	async fetchVacancies(
		filters: SearchFilters,
	): Promise<IParserVacancyResponse | null> {
		try {
			const response = await $parserApi.getVacancies(filters)

			if (!response) {
				return null
			}

			const { data, meta, success } = response as IParserVacancyResponse

			return response
		} catch (error) {
			console.error('Error fetching vacancies:', error)
			return null
		}
	}
}
