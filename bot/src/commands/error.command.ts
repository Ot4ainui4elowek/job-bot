import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { filters } from '../api/hh.ru/types'
import { $commands } from '../consts/commands'
import {
	getAutoSession,
	getSessionFromId,
	updateSession,
} from '../context/context.entity'
import { IBotContext } from '../context/context.interface'
import { formatObjectsToStrings } from '../helpers/fromat-objects.to-string'
import { Command } from './command.class'
import { SearchHears } from './search/search.command'
import { StartHears } from './start.command'

export class ErrorCommand extends Command {
	constructor(bot: Telegraf<IBotContext>) {
		super(bot)
	}

	filters = formatObjectsToStrings(filters)
	searchButtons = formatObjectsToStrings(SearchHears)
	startButtons = formatObjectsToStrings(StartHears)
	messages = [...this.filters, ...this.searchButtons, ...this.startButtons]
	handle(): void {
		this.bot.on(message('text'), async (ctx, next) => {
			const userId = ctx.from?.id

			if (!userId) {
				ctx.reply('Не удалось определить пользователя')
				return
			}
			const text = ctx.message.text.trim()
			const isLoading = getSessionFromId(userId).isLoading
			if (this.messages.includes(text)) {
				updateSession(userId, {
					awaitingFilter: undefined,
					waitingForVacancy: false,
				})
				next()
				return
			}

			const isCommand = Object.values($commands).some(
				cmd => cmd === text.replace('/', ''),
			)
			if (isCommand) return next()

			const waitingForVacancy = (await getAutoSession(ctx)).waitingForVacancy
			const awaitingFilter = (await getAutoSession(ctx)).awaitingFilter
			if (waitingForVacancy || awaitingFilter) {
				return next()
			}
			await ctx.reply('Я не знаю таких команд! 😅')
		})
	}
}
