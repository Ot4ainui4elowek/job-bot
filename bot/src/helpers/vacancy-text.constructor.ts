import { IHHVacancy } from '../api/hh.ru/types'
const stripHighlightTags = (input?: string) => {
	if (!input) return ''
	return input.replace(/<\/?highlighttext>/g, '').trim()
}
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
export const VacancyTextConstructor = (vacancy: IHHVacancy): string => {
	let salaryText = 'не указано'
	if (vacancy.salary) {
		const cur = vacancy.salary.currency ?? ''
		if (vacancy.salary.from && vacancy.salary.to)
			salaryText = `${fmt(vacancy.salary.from)} — ${fmt(
				vacancy.salary.to
			)} ${cur}`
		else if (vacancy.salary.from)
			salaryText = `от ${fmt(vacancy.salary.from)} ${cur}`
		else if (vacancy.salary.to)
			salaryText = `до ${fmt(vacancy.salary.to)} ${cur}`
	}

	const published = vacancy.published_at
		? new Date(vacancy.published_at).toLocaleString('ru-RU')
		: 'не указано'
	const experience = vacancy.experience?.name ?? 'не указано'
	const schedule = vacancy.schedule?.name ?? 'не указано'
	const employment = vacancy.employment_form?.name ?? 'не указано'
	const address = vacancy.address?.raw ?? ''
	const requirement = vacancy.snippet?.requirement ?? ''
	const responsibility = vacancy.snippet?.responsibility ?? ''

	const messageText = `💼 ${stripHtml(vacancy.name)}
🏢 ${stripHtml(vacancy.employer?.name) || 'Компания не указана'}${
		vacancy.employer?.alternate_url
			? ' — ' + vacancy.employer.alternate_url
			: ''
	}
📍 ${stripHtml(vacancy.area?.name) || 'Локация не указана'}${
		address ? ' — ' + stripHtml(address) : ''
	}
📅 Опубликовано: ${published}
⌛ Опыт: ${stripHtml(experience)}
🕒 График: ${stripHtml(schedule)}
📎 Тип занятости: ${stripHtml(employment)}
💰 Зарплата: ${salaryText}
📝 Требования: ${stripHighlightTags(requirement) || 'не указано'}
📝 Обязанности: ${stripHighlightTags(responsibility) || 'не указано'}
🔗 Ссылка: ${vacancy.alternate_url}`

	return messageText
}
