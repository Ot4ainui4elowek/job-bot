import { Markup, Telegraf } from 'telegraf'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersMessage } from '../../helpers/get-filters-message'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'

const perPageOptions = [3, 5, 7, 9]

export const editPerPage = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	const session = await getAutoSession(ctx)
	const userId = session.userId!

	// Удаляем предыдущее сообщение бота
	await MessageCleanupService.deleteLastBotMessage(ctx)

	// Отправляем меню выбора
	const message = await ctx.reply(
		'Выберите количество отображаемых вакансий на странице:',
		Markup.inlineKeyboard(
			perPageOptions.map(n => ({
				text: n.toString(),
				callback_data: `per_page_${n}`,
			})),
		),
	)

	// Трекаем сообщение
	await MessageCleanupService.trackFlowMessage(ctx, message.message_id)
	updateSession(userId, { lastBotMessageId: message.message_id })

	bot.action(/per_page_(\d+)/, async ctx => {
		const userId = ctx.from?.id
		if (!userId) return

		const perPage = Number(ctx.match[1])

		// Удаляем меню выбора
		await ctx.deleteMessage()

		// Показываем временное подтверждение
		await MessageCleanupService.sendTemporary(
			ctx,
			`📃 Количество на странице: ${perPage}`,
			2000,
		)

		const session = await getAutoSession(ctx)
		updateSession(session.userId!, {
			awaitingFilter: undefined,
		})
		updateFilters(session.userId!, {
			limit: perPage,
		})

		// Возвращаем меню фильтров
		// В конце каждого onSelect callback:

		// Возвращаем меню фильтров и сохраняем его ID
		const filtersMessage = await getFiltersMessage(ctx)

		if (filtersMessage?.message_id) {
			updateSession(userId, { lastBotMessageId: filtersMessage.message_id })
		}
	})
}
