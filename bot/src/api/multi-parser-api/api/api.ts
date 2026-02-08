import axios, { AxiosError, AxiosInstance } from 'axios'

import { ConfigService } from '../../../config/config.service'
import { IParserDictionaries } from '../types/dictionaries'
import { SearchFilters } from '../types/vacancy-search-filters.interface'
import { IParserVacancyResponse } from '../types/vacancy.response'

export class MultiParserApi {
	constructor(private readonly url: string) {
		this.$api = axios.create({ baseURL: url })
	}
	$api: AxiosInstance
	public async getVacancies({
		keywords,
		locations,
		salary,
		experience,
		schedule,
		employment,
		currency,
		limit = 10,
		page = 0,
		useSemanticSearch = false,
		userId,
		locationType = 'moldova',
		searchBy = 'category',
		sources,
	}: SearchFilters): Promise<IParserVacancyResponse | null> {
		console.log('Query:' + keywords)
		try {
			// Формируем query параметры
			const params = new URLSearchParams({
				limit: limit.toString(),
				page: (page + 1).toString(),
				useSemanticSearch: useSemanticSearch.toString(),
				searchBy,
				locationType,
				workLocationType: locationType,
			})

			// Добавляем опциональные параметры
			if (keywords) {
				params.append('keywords', keywords)
			}

			// if (locations) {
			// 	params.append('locations', locations)
			// }

			if (salary !== undefined && salary.min != undefined) {
				params.append('salaryMin', salary.min.toString())
			}

			// if (salary !== undefined && salary.max) {
			// 	params.append('salaryMax', salary.max.toString())
			// }

			if (experience) {
				params.append('experience', experience)
			}

			if (schedule) {
				params.append('schedule', schedule)
			}

			if (employment) {
				params.append('employment', employment)
			}

			if (currency) {
				params.append('currency', currency)
			}

			if (userId !== undefined) {
				params.append('userId', userId.toString())
			}

			if (sources) {
				params.append('sources', sources)
			}
			console.log('params:' + params)
			const response = await this.$api.get<IParserVacancyResponse>(
				`vacancies?${params.toString()}`,
				{ timeout: 60000 },
			)

			console.log(JSON.stringify(response.data.data[0]))
			return response.data
		} catch (e) {
			const error = e as AxiosError
			console.error(error.response?.data, error.code)
			return null
		}
	}
	public async getDictionaries(): Promise<IParserDictionaries | undefined> {
		try {
			return (await this.$api.get<IParserDictionaries>('dictionaries')).data
		} catch (e) {
			const err = e as AxiosError
			console.error(err.message)
		}
	}
}
const config = new ConfigService()

export const $parserApi = new MultiParserApi(config.get('MULTI_PARSER_URL'))
