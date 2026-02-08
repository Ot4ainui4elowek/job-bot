import { Markup } from 'telegraf'
import { filters } from '../api/hh.ru/types'
import { clearSession, updateSession } from '../context/context.entity'
import { IBotContext } from '../context/context.interface'
import { getFiltersText } from '../helpers/get-filters-message'
import { MessageCleanupService } from '../helpers/message-cleanup-service'

export const clearFilters = async (ctx: IBotContext) => {
	await MessageCleanupService.deleteLastBotMessage(ctx)
	const userId = ctx.from?.id

	if (!userId) {
		ctx.reply('Не удалось определить пользователя')
		return
	}
	clearSession(userId)
	const filtersMessage = await ctx.reply(
		'Фильтры сброшены\n' + (await getFiltersText(ctx)),
		getFilterKeyboard(),
	)

	if (filtersMessage?.message_id) {
		updateSession(userId, {
			lastBotMessageId: filtersMessage.message_id,
		})
	}
}

// export const getFilterKeyboard = () =>
// 	Markup.keyboard([
// 		...Object.entries(filters).map(([key, label]) => Markup.button.text(label)),
// 		Markup.button.text('❌ СБРОСИТЬ ФИЛЬТРЫ'),
// 	]).resize()
export const getFilterKeyboard = () => {
	const filterButtons = Object.entries(filters).map(([key, label]) =>
		Markup.button.text(label),
	)

	// Разбиваем на пары (по 2 кнопки в ряд)
	const rows = []
	for (let i = 0; i < filterButtons.length; i += 2) {
		rows.push(filterButtons.slice(i, i + 2))
	}

	return Markup.keyboard([...rows]).resize()
}
