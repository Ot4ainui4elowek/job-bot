import { SearchFilters } from '../hh.ru/types'
import { IAgregatorResponse } from './types/agregator-response'

export abstract class AgregatorStrategy {
	abstract getVacancies(filters: SearchFilters): Promise<IAgregatorResponse>
}
