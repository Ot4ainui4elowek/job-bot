import { Telegraf } from 'telegraf'
import {
	EXPERIENCE,
	Experience,
} from '../../api/multi-parser-api/types/filters-dictionary'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'
import { createFilterSelector } from './create-filter-selector'

export const editExperience = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	await createFilterSelector(ctx, bot, {
		filterName: 'experience',
		title: 'Выберите требуемый опыт работы:',
		dictionary: EXPERIENCE,
		errorMessage: 'Опыт работы введен неверно',
		onSelect: async (selectedKey, ctx) => {
			const session = await getAutoSession(ctx)
			const userId = session.userId!

			// Получаем текст выбранного опыта
			const selectedLabel = EXPERIENCE[selectedKey as keyof typeof EXPERIENCE]

			// Показываем временное подтверждение
			if (selectedLabel) {
				await MessageCleanupService.sendTemporary(
					ctx,
					`📊 Опыт работы: ${selectedLabel}`,
					2000,
				)
			}

			// Обновляем сессию и фильтры
			updateSession(userId, {
				awaitingFilter: undefined,
				searchResults: undefined,
			})

			updateFilters(userId, {
				experience: selectedKey as Experience,
			})
		},
	})
}
