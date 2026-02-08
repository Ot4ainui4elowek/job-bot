import { type IHHVacancyResponse } from '../../hh.ru/types/vacancy.response'
import { IParserVacancyResponse } from '../../multi-parser-api/types/vacancy.response'
export type IAgregatorResponse = IHHVacancyResponse | IParserVacancyResponse
