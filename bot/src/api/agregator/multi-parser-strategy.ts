import { SearchFilters } from '../hh.ru/types'
import { MultiParserApi } from '../multi-parser-api/api/api'
import { IParserVacancyResponse } from '../multi-parser-api/types/vacancy.response'
import { ParserStrategy } from './constants/strategy'
interface Props {
	multiParserApi: MultiParserApi
	strategy: ParserStrategy
	filters: SearchFilters
}
export const parserStrategy = async ({
	multiParserApi,
	strategy,
	filters,
}: Props): Promise<IParserVacancyResponse | null> => {
	const response = await multiParserApi.getVacancies(
		filters.text ?? '',
		filters.limit ?? 10,
		filters.page ?? 0,
		strategy,
	)
	return response
}
