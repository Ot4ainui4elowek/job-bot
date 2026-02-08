// src/hh/types.ts
import {
	DictionaryItem,
	EmploymentId,
	ExperienceId,
	ScheduleId,
} from '../constants/dictionary'

export interface IHHVacancy {
	id: string
	premium: boolean
	name: string
	department: string | null
	has_test: boolean
	response_letter_required: boolean

	area: {
		id: string
		name: string
		url: string
	}

	salary: {
		from: number | null
		to: number | null
		currency: string
		gross: boolean
	} | null

	salary_range:
		| (IHHVacancy['salary'] & {
				mode: DictionaryItem<'MONTH' | string>
				frequency: DictionaryItem<'DAILY' | string>
		  })
		| null

	type: DictionaryItem<string>

	address: any | null
	response_url: string | null
	sort_point_distance: number | null

	published_at: string
	created_at: string

	archived: boolean
	apply_alternate_url: string
	show_logo_in_search: boolean | null
	show_contacts: boolean
	insider_interview: any | null

	url: string
	alternate_url: string

	relations: any[]
	employer: {
		id: string
		name: string
		url: string
		alternate_url: string
		logo_urls: {
			original: string
			'90': string
			'240': string
		}
		vacancies_url: string
		country_id: number
		accredited_it_employer: boolean
		trusted: boolean
	}

	snippet: {
		requirement: string | null
		responsibility: string | null
	}

	contacts: any | null

	schedule: DictionaryItem<ScheduleId>
	working_days: DictionaryItem<string>[]
	working_time_intervals: DictionaryItem<string>[]
	working_time_modes: DictionaryItem<string>[]

	accept_temporary: boolean
	fly_in_fly_out_duration: DictionaryItem<string>[]

	work_format: DictionaryItem<string>[]
	working_hours: DictionaryItem<string>[]
	work_schedule_by_days: DictionaryItem<string>[]

	night_shifts: boolean
	professional_roles: DictionaryItem<string>[]

	accept_incomplete_resumes: boolean

	experience: DictionaryItem<ExperienceId>
	employment: DictionaryItem<EmploymentId>
	employment_form: DictionaryItem<string>

	internship: boolean
	adv_response_url: string | null
	is_adv_vacancy: boolean
	adv_context: string | null
}
