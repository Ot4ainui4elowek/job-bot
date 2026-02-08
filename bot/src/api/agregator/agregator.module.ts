import { HHClient } from '../hh.ru/api/hh-api'
import { SearchFilters } from '../hh.ru/types'
import { IHHVacancyResponse } from '../hh.ru/types/vacancy.response'
import { MultiParserApi } from '../multi-parser-api/api/api'
import { IParserVacancyResponse } from '../multi-parser-api/types/vacancy.response'
import { $agregatorStrategy, AgregatorStrategyType } from './constants/strategy'
import { hhStrategy } from './hh.strategy'
import { parserStrategy } from './multi-parser-strategy'
import { IAgregatorResponse } from './types/agregator-response'
type VacancyResponse<T extends AgregatorStrategyType> =
	T extends typeof $agregatorStrategy.HH
		? IHHVacancyResponse
		: IParserVacancyResponse | null

export class AgregatorModule {
	constructor(
		private hhApi: HHClient,
		private multiParserApi: MultiParserApi
	) {}

	public async fetchVacancies<T extends AgregatorStrategyType>(
		strategy: T,
		filters?: SearchFilters
	): Promise<VacancyResponse<T>> {
		if (filters === null) {
			throw new Error('Filters is null')
		}
		const response = await this.getVacancies(strategy, filters as SearchFilters)

		if (strategy === $agregatorStrategy.HH) {
			return response as VacancyResponse<T>
		}

		return response as VacancyResponse<T>
	}

	private async getVacancies(
		strategy: AgregatorStrategyType,
		filters: SearchFilters
	): Promise<IAgregatorResponse | null> {
		if (strategy === $agregatorStrategy.HH) {
			return await hhStrategy(this.hhApi, filters)
		}
		if (Object.values($agregatorStrategy).includes(strategy)) {
			return await parserStrategy({
				filters,

				multiParserApi: this.multiParserApi,
				strategy,
			})
		} else {
			throw new Error('Invalid getVacancies strategy')
		}
	}
}
