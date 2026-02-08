import { Markup, Telegraf } from 'telegraf'
import { $commands } from '../consts/commands'
import { IBotContext } from '../context/context.interface'
import { Command } from './command.class'
import { StartKeyboard } from './start.command'

const SEARCH_TEXT = `/${$commands.search}`
const FILTERS_TEXT = `/${$commands.filters}`
const SAVED_TEXT = 'Сохранённые вакансии'

export class HelpCommand extends Command {
	constructor(bot: Telegraf<IBotContext>) {
		super(bot)
	}

	handle(): void {
		this.bot.command('menu', async ctx => {
			await ctx.reply('Открытие мнею', StartKeyboard)
		})

		this.bot.command('help', async ctx => {
			const helpText = `👋 *Добро пожаловать в бот для поиска вакансий!*

Я помогу найти работу мечты на популярных площадках:
🔹 HH.ru
🔹 Rabota.md
🔹 Makler.md
🔹 999.md

*📋 Основные возможности:*

🔍 *Поиск вакансий*
Команда /${$commands.search} или кнопка "Поиск вакансий"
Просто введите название должности и выберите площадку

⚙️ *Настройка фильтров*
Команда /${$commands.filters} или кнопка "Изменить фильтры"
Настройте регион, зарплату, опыт работы и другие параметры

💡 *Совет:* Используйте кнопки ниже для быстрого доступа к функциям!`

			await ctx.reply(helpText, {
				parse_mode: 'Markdown',
				...Markup.keyboard([SEARCH_TEXT, FILTERS_TEXT]).resize().oneTime(),
			})
		})
	}
}
