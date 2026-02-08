import { Markup, Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { SearchButton } from '../inline-buttons/search.button'
import { Command } from './command.class'

export const StartHears = {
	search: '🔍 Поиск',
	filters: '⚙️ Фильтры',
}

export class StartCommand extends Command {
	constructor(bot: Telegraf<IBotContext>) {
		super(bot)
	}

	handle(): void {
		this.bot.start(ctx => {
			SearchButton.bindLogic(this.bot, [
				async ctx => {
					await ctx.deleteMessage()
				},
			])
			this.sendWelcomeMessage(ctx)
		})
	}

	private async sendWelcomeMessage(ctx: IBotContext): Promise<void> {
		await ctx.reply(
			'👋 *Привет!*\n\n' +
				'Я бот для поиска вакансий на популярных площадках:\n' +
				'• HH.ru\n' +
				'• Rabota.md\n' +
				'• Makler.md\n' +
				'• 999.md\n\n' +
				'🔍 Помогу быстро найти подходящую работу по твоим параметрам!\n\n' +
				'*Доступные команды:*\n' +
				'/start — запуск бота\n' +
				'/help — справка по использованию бота',
			{
				parse_mode: 'Markdown',
				...StartKeyboard,
			},
		)
	}
}

export const StartKeyboard = Markup.keyboard([
	[StartHears.search, StartHears.filters],
])
	.resize()
	.persistent()
