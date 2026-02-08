// src/hh/client.ts
import axios from 'axios'
import { IHHVacancy, SearchFilters } from '../types'
import { AreasResponse } from '../types/region.interface'
import { IHHVacancyResponse } from '../types/vacancy.response'

export class HHClient {
	private baseUrl = 'https://api.hh.ru'

	$api = axios.create({
		baseURL: this.baseUrl,
	})

	async searchVacancies(filters: SearchFilters): Promise<IHHVacancyResponse> {
		const params: Record<string, any> = {
			per_page: filters.per_page ?? 10,
			page: filters.page ?? 0,
			search_field: 'name',
		}
		if (filters.text) params.text = filters.text
		// if (filters.area) params.area = filters.area.id
		if (filters.salary) params.salary = filters.salary
		if (filters.experience) params.experience = { id: filters.experience.id }
		console.log('HHClient searchVacancies params:', params)
		try {
			const response = await axios.get<IHHVacancyResponse>(
				`${this.baseUrl}/vacancies`,
				{ params },
			)
			return response.data
		} catch (error) {
			console.error('Error searching vacancies:', error)
			throw error
		}
	}

	async getVacancyById(id: string): Promise<IHHVacancy> {
		try {
			const res = await axios.get<IHHVacancy>(`${this.baseUrl}/vacancies/${id}`)
			return res.data
		} catch (error) {
			console.error('Error fetching vacancy by ID:', error)
			throw error
		}
	}

	async getAreas(): Promise<AreasResponse[]> {
		try {
			const res = await axios.get<AreasResponse[]>(`${this.baseUrl}/areas`)
			return res.data
		} catch (error) {
			console.error('Error fetching areas:', error)
			throw error
		}
	}
}
