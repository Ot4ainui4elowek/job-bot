import { IParserVacancy } from '../api/multi-parser-api/types/vacancy'

const stripHtml = (input?: string) => {
	if (!input) return ''
	// remove tags
	let s = input.replace(/<[^>]*>/g, '')
	// decode a few common entities
	s = s.replace(/&nbsp;/g, ' ')
	s = s.replace(/&amp;/g, '&')
	s = s.replace(/&lt;/g, '<')
	s = s.replace(/&gt;/g, '>')
	s = s.replace(/&quot;/g, '"')
	s = s.replace(/&#39;/g, "'")
	return s.trim()
}

const fmt = (num: number) => new Intl.NumberFormat('ru-RU').format(num)

export const VacancyTextConstructorParser = (
	vacancy: IParserVacancy,
): string => {
	const {
		title,
		company,
		salary,
		location,
		experience,
		schedule,
		education,
		workPlace,
		employmentType,
		languages,
		author,
		seasonal,
		vacancyType,
		industry,
		specialization,
		publishedAt,
		url,
		source,
	} = vacancy

	// Функция для нормализации текста (убирает лишние пробелы и переносы)
	const normalize = (text: string | undefined): string => {
		if (!text) return ''
		return text
			.replace(/\s+/g, ' ') // Заменяем множественные пробелы и переносы на один пробел
			.trim() // Убираем пробелы по краям
	}

	// Форматируем дату публикации
	let formattedDate = ''
	if (publishedAt) {
		const date =
			publishedAt instanceof Date ? publishedAt : new Date(publishedAt)
		formattedDate = date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	// Собираем текст вакансии
	const parts = [
		`🔹 ${normalize(title)}`,
		company ? `🏢 Компания: ${normalize(company)}` : '',
		salary ? `💰 Зарплата: ${normalize(salary)}` : '',
		location ? `📍 Локация: ${normalize(location)}` : '',
		experience ? `💼 Опыт: ${normalize(experience)}` : '',
		schedule ? `📅 График: ${normalize(schedule)}` : '',
		workPlace ? `🏠 Место работы: ${normalize(workPlace)}` : '',
		employmentType ? `📋 Тип занятости: ${normalize(employmentType)}` : '',
		education ? `🎓 Образование: ${normalize(education)}` : '',
		languages && languages.length > 0
			? `🌐 Языки: ${languages.join(', ')}`
			: '',
		author ? `👤 Автор: ${normalize(author)}` : '',
		seasonal ? `🌸 Сезонная работа` : '',
		vacancyType ? `🔖 Тип вакансии: ${normalize(vacancyType)}` : '',
		industry ? `🏭 Сфера: ${normalize(industry)}` : '',
		specialization ? `🎯 Специализация: ${normalize(specialization)}` : '',
		formattedDate ? `📆 Опубликовано: ${formattedDate}` : '',
		`🔗 Источник: ${source}`,
		``,
		`Подробнее: ${normalize(url)}`,
	]

	// Фильтруем пустые строки и объединяем
	return parts
		.filter(part => part.trim() !== '')
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
}
