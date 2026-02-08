import {
	CURRENCIES,
	EMPLOYMENT_TYPES,
	EXPERIENCE,
	SCHEDULE_TYPES,
} from '../api/multi-parser-api/types/filters-dictionary'
import { getAutoSession } from '../context/context.entity'
import { IBotContext } from '../context/context.interface'
import { getFilterKeyboard } from '../inline-buttons/filter-buttons'

export const getFiltersText = async (
	ctx: IBotContext,
	updatedFilter?: boolean,
): Promise<string> => {
	const session = await getAutoSession(ctx)
	const { filters } = session

	const parts: string[] = []

	if (filters.area) {
		parts.push(`📍 Регион: ${filters.area}`)
	}

	if (filters.salary?.label) {
		parts.push(`💰 Зарплата: ${filters.salary?.label}`)
	}

	if (filters.experience) {
		const experienceLabel =
			EXPERIENCE[filters.experience as keyof typeof EXPERIENCE] ||
			filters.experience
		parts.push(`📊 Опыт: ${experienceLabel}`)
	}

	if (filters.employment) {
		const employmentLabel =
			EMPLOYMENT_TYPES[filters.employment as keyof typeof EMPLOYMENT_TYPES] ||
			filters.employment
		parts.push(`💼 Тип занятости: ${employmentLabel}`)
	}

	if (filters.currency) {
		const currencyLabel =
			CURRENCIES[filters.currency as keyof typeof CURRENCIES] ||
			filters.currency
		parts.push(`💵 Валюта: ${currencyLabel}`)
	}

	if (filters.schedule) {
		const scheduleLabel =
			SCHEDULE_TYPES[filters.schedule as keyof typeof SCHEDULE_TYPES] ||
			filters.schedule
		parts.push(`📅 График работы: ${scheduleLabel}`)
	}

	parts.push(`📃 Результатов на странице: ${filters.limit || 3}`)

	if (parts.length === 0) {
		return '🔍 Фильтры не установлены'
	}

	let str = `${updatedFilter ? '✅ Фильтр обновлён!\n\n' : ''}🔍 Текущие фильтры:\n\n${parts.join('\n')}`
	return str
}

export const getFiltersMessage = async (ctx: IBotContext) => {
	const filtersText = await getFiltersText(ctx)

	const message = await ctx.reply(
		'Выберите, что хотите изменить:\n' + filtersText,
		getFilterKeyboard(),
	)

	return message // Возвращаем сообщение
}
