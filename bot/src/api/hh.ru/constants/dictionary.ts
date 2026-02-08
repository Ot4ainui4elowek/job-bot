// src/hh/dictionaries.ts

export const DICTIONARY = {
	experience: [
		{ id: 'noExperience', name: 'Нет опыта' },
		{ id: 'between1And3', name: 'От 1 года до 3 лет' },
		{ id: 'between3And6', name: 'От 3 до 6 лет' },
		{ id: 'moreThan6', name: 'Более 6 лет' },
	] as const,

	employment: [
		{ id: 'full', name: 'Полная занятость' },
		{ id: 'part', name: 'Частичная занятость' },
		{ id: 'project', name: 'Проектная работа' },
		{ id: 'volunteer', name: 'Волонтерство' },
		{ id: 'probation', name: 'Стажировка' },
	] as const,
	vacancySearchOrder: [
		{ id: 'publication_time', name: 'по дате' },
		{ id: 'salary_desc', name: 'по убыванию дохода' },
		{ id: 'salary_asc', name: 'по возрастанию дохода' },
		{ id: 'relevance', name: 'по соответствию' },
	] as const,

	vacancySearchFields: [
		{ id: 'name', name: 'в названии вакансии' },
		{ id: 'company_name', name: 'в названии компании' },
		{ id: 'description', name: 'в описании вакансии' },
	] as const,
	schedule: [
		{ id: 'fullDay', name: 'Полный день' },
		{ id: 'shift', name: 'Сменный график' },
		{ id: 'flexible', name: 'Гибкий график' },
		{ id: 'remote', name: 'Удаленная работа' },
		{ id: 'flyInFlyOut', name: 'Вахтовый метод' },
	] as const,

	// … можно добавить остальные твоих словарей
}

export type ExperienceId = (typeof DICTIONARY.experience)[number]['id']
export type EmploymentId = (typeof DICTIONARY.employment)[number]['id']
export type ScheduleId = (typeof DICTIONARY.schedule)[number]['id']
export type VacancySearchOrderId =
	(typeof DICTIONARY.vacancySearchOrder)[number]['id']
export type VacancySearchFieldsId =
	(typeof DICTIONARY.vacancySearchFields)[number]['id']

// Интерфейсы для структуры геолокационных данных HH.ru

export type DictionaryItem<T extends string> = {
	id: T
	name: string
}
