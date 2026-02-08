import { SearchFilters } from '../hh.ru/types'
import { AgregatorStrategy } from './agregator-strategy.class'
import { IAgregatorResponse } from './types/agregator-response'

export const getVacancies = async (
	agregatorStrategy: AgregatorStrategy,
	filters: SearchFilters
): Promise<IAgregatorResponse> => {
	return await agregatorStrategy.getVacancies(filters)
}
