import { Markup, Telegraf } from 'telegraf'
import {
	getAutoSession,
	getSessionFromId,
	updateFilters,
} from '../context/context.entity'
import { IBotContext, SessionData } from '../context/context.interface'

const paginationMessage = async (
	ctx: IBotContext,
	next: () => Promise<void>,
	bot: Telegraf<IBotContext>,
	sendVacancies: (ctx: IBotContext, next: () => Promise<void>) => Promise<void>,
) => {
	const userId = ctx.from?.id

	if (!userId) {
		ctx.reply('Не удалось определить пользователя')
		return
	}
	const session = await getAutoSession(ctx)
	const buttons = createPaginationButtons(session)

	bot.action('page_prev', async ctx => {
		const userId = ctx.from?.id

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя')
			return
		}
		const session = getSessionFromId(userId)
		const current = session.filters.page || 0
		if (current <= 0) {
			await ctx.answerCbQuery('Это первая страница')
			return
		}
		updateFilters(userId, {
			...session.filters,
			page: (session.filters.page ?? 0) - 1,
		})
		await ctx.deleteMessage().catch(() => null)
		await sendVacancies(ctx as IBotContext, next)
		await ctx.answerCbQuery()
	})
	bot.action(/page_disabled_(.+)/, async ctx => {
		const direction = ctx.match[1]
		const message =
			direction === 'prev'
				? '⚠️ Это первая страница'
				: '⚠️ Это последняя страница'
		await ctx.answerCbQuery(message)
	})

	bot.action('page_next', async ctx => {
		const userId = ctx.from?.id

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя')
			return
		}
		const session = getSessionFromId(userId)
		const {
			filters: { page },
			maxSearchPage,
		} = session

		if ((page || 0) + 1 > maxSearchPage!) {
			await ctx.answerCbQuery('Это последняя страница')
			return
		}
		updateFilters(userId, {
			...session.filters,
			page: (session.filters.page ?? 0) + 1,
		})
		await ctx.deleteMessage().catch(() => null)
		await sendVacancies(ctx as IBotContext, next)
		await ctx.answerCbQuery()
	})

	bot.action('page_current', async ctx => {
		await ctx.answerCbQuery('Это текущая страница')
	})
	await ctx.reply(`Выберите действие:`, Markup.inlineKeyboard(buttons))
}

function createPaginationButtons(session: SessionData) {
	const currentPage = session.filters.page ?? 0
	const maxPage = session.maxSearchPage ?? 0

	const prevEnabled = currentPage > 0
	const nextEnabled = currentPage + 1 < maxPage

	return [
		Markup.button.callback(
			prevEnabled ? '⏮️ Предыдущая' : '🔒 Предыдущая',
			prevEnabled ? 'page_prev' : 'page_disabled_prev',
		),
		Markup.button.callback(`📄 ${currentPage + 1}/${maxPage}`, 'page_info'),
		Markup.button.callback(
			nextEnabled ? 'Следующая ⏭️' : 'Следующая 🔒',
			nextEnabled ? 'page_next' : 'page_disabled_next',
		),
	]
}

export default paginationMessage
