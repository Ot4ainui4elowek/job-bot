import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersMessage } from '../../helpers/get-filters-message'

export const editArea = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	bot.on(message('text'), async ctx => {
		await ctx.reply('Введите название нового региона:')
		const userId = ctx.from.id
		const session = await getAutoSession(ctx)

		const query = ctx.message.text.trim()
		if (!query.length) {
			ctx.reply(`Регион введен неверно!`)
			return
		}

		updateSession(session.userId!, {
			awaitingFilter: undefined,
		})
		updateFilters(session.userId!, {
			area: query,
		})

		getFiltersMessage(ctx)
	})
}
