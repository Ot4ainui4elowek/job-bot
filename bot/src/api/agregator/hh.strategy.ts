import { HHClient } from '../hh.ru/api/hh-api'
import { SearchFilters } from '../hh.ru/types'
import { IHHVacancyResponse } from '../hh.ru/types/vacancy.response'

export const hhStrategy = async (
	hhClient: HHClient,
	filters: SearchFilters
): Promise<IHHVacancyResponse> => {
	const response = await hhClient.searchVacancies({
		...filters,
	})
	console.log(response.items.length)
	return response
}
