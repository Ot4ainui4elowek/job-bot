import { Markup, Telegraf } from 'telegraf'
import { getAutoSession, updateSession } from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersMessage } from '../../helpers/get-filters-message'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'

export const createFilterSelector = async <T extends Record<string, string>>(
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
	options: {
		filterName: string
		title: string
		dictionary: T
		errorMessage: string
		onSelect: (selectedKey: keyof T, ctx: IBotContext) => void | Promise<void>
	},
) => {
	const session = await getAutoSession(ctx)
	const userId = session.userId!
	const items = Object.entries(options.dictionary)

	// Удаляем предыдущее сообщение бота
	await MessageCleanupService.deleteLastBotMessage(ctx)

	// Отправляем меню
	const message = await ctx.reply(
		options.title,
		Markup.inlineKeyboard(
			items.map(([key, label]) => [
				Markup.button.callback(label as string, `${options.filterName}_${key}`),
			]),
		),
	)

	// Трекаем сообщение
	await MessageCleanupService.trackFlowMessage(ctx, message.message_id)
	updateSession(userId, { lastBotMessageId: message.message_id })

	bot.action(new RegExp(`^${options.filterName}_(.+)$`), async ctx => {
		const selectedKey = ctx.match[1]

		if (!selectedKey || !(selectedKey in options.dictionary)) {
			await ctx.answerCbQuery(`❌ ${options.errorMessage}`)
			return
		}

		// Вызываем callback
		await options.onSelect(selectedKey as keyof T, ctx)

		// Удаляем меню
		await ctx.deleteMessage()

		// Возвращаем меню фильтров
		// В конце каждого onSelect callback:

		// Возвращаем меню фильтров и сохраняем его ID
		const filtersMessage = await getFiltersMessage(ctx)

		if (filtersMessage?.message_id) {
			updateSession(userId, { lastBotMessageId: filtersMessage.message_id })
		}
	})
}
