import { Telegraf } from 'telegraf'
import {
	EMPLOYMENT_TYPES,
	EmploymentType,
} from '../../api/multi-parser-api/types/filters-dictionary'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersMessage } from '../../helpers/get-filters-message'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'
import { createFilterSelector } from './create-filter-selector'

export const editEmployment = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	await createFilterSelector(ctx, bot, {
		filterName: 'employment',
		title: 'Выберите тип занятости:',
		dictionary: EMPLOYMENT_TYPES,
		errorMessage: 'Тип занятости введен неверно',
		onSelect: async (selectedKey, ctx) => {
			const session = await getAutoSession(ctx)
			const userId = session.userId!

			// Удаляем меню выбора
			await ctx.deleteMessage()

			// Получаем текст выбранного типа занятости
			const selectedLabel = EMPLOYMENT_TYPES[selectedKey as EmploymentType]

			// Показываем временное подтверждение
			if (selectedLabel) {
				await MessageCleanupService.sendTemporary(
					ctx,
					`💼 Тип занятости: ${selectedLabel}`,
					2000,
				)
			}

			// Обновляем сессию и фильтры
			updateSession(userId, {
				awaitingFilter: undefined,
				searchResults: undefined,
			})

			updateFilters(userId, {
				employment: selectedKey as EmploymentType,
			})

			// Возвращаем меню фильтров
			// В конце каждого onSelect callback:

			// Возвращаем меню фильтров и сохраняем его ID
			const filtersMessage = await getFiltersMessage(ctx)

			if (filtersMessage?.message_id) {
				updateSession(userId, { lastBotMessageId: filtersMessage.message_id })
			}
		},
	})
}
