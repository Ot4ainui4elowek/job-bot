import { Markup, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { IBotContext } from '../../context/context.interface'

import { filters, SearchFilters } from '../../api/hh.ru/types'
import { MultiParserApi } from '../../api/multi-parser-api/api/api'
import { IParserVacancyResponse } from '../../api/multi-parser-api/types/vacancy.response'
import {
	getAutoSession,
	getSessionFromId,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { VacancyService } from '../../helpers/get-vacancies'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'
import { VacancyDisplay } from '../../helpers/send-vacancies-message'
import paginationMessage from '../../inline-buttons/pagination-msg'
import { Command } from '../command.class'
import { StartHears } from '../start.command'
import {
	SearchFromCategory,
	SearchFromCategoryKeyboard,
} from './search-from-category'

export const SearchHears = {
	back: filters.back,
	md: '🇲🇩Поиск по Молдове',
	wrld: '🌐Поиск за границей',
} as const

export const SearchButtons = Markup.keyboard([
	[SearchHears.md],
	[SearchHears.back, SearchHears.wrld],
])
	.resize()
	.persistent()

export class SearchCommand extends Command {
	constructor(
		bot: Telegraf<IBotContext>,
		private readonly multiparser: MultiParserApi,
	) {
		super(bot)
	}
	vacancyService: VacancyService = new VacancyService()
	SearchButtonsLogic() {
		const text =
			'Введите поисковой запрос:\nЛибо выберите подходящую категорию из вакансии:'
		this.bot.hears(SearchHears.md, async ctx => {
			const userId = ctx.from?.id

			if (!userId) {
				await ctx.reply('Не удалось определить пользователя')
				return
			}
			const filtersMessage = await ctx.reply(
				'Выполняю поиск вакансий по Молдове.\n' + text,
				SearchFromCategoryKeyboard,
			)
			MessageCleanupService.trackFlowMessage(ctx, filtersMessage.message_id)
			updateFilters(userId, { locationType: 'moldova' })
			updateSession(userId, { waitingForVacancy: true })

			// Сохраняем ID сообщения с информацией о фильтрах
		})
		this.bot.hears(SearchHears.wrld, async ctx => {
			const userId = ctx.from?.id

			if (!userId) {
				await ctx.reply('Не удалось определить пользователя')
				return
			}
			const filtersMessage = await ctx.reply(
				'Выполняю поиск вакансий за границей.\n' + text,
				SearchFromCategoryKeyboard,
			)
			MessageCleanupService.trackFlowMessage(ctx, filtersMessage.message_id)
			updateFilters(userId, { locationType: 'abroad' })
			updateSession(userId, { waitingForVacancy: true })
			// Сохраняем ID сообщения с информацией о фильтрах
		})
		SearchFromCategory(this.bot, this.vacancyService)
	}

	handle(): void {
		this.SearchButtonsLogic()
		this.bot.hears(StartHears.search, async ctx => {
			const userId = ctx.from?.id

			if (!userId) {
				ctx.reply('Не удалось определить пользователя')
				return
			}
			updateFilters(userId, { page: 0 })
			ctx.reply('Выберите критерий поиска:', SearchButtons)
		})
		this.bot.on(message('text'), async (ctx, next) => {
			const userId = ctx.from?.id

			if (!userId) {
				await ctx.reply('Не удалось определить пользователя')
				return
			}
			const session = getSessionFromId(userId)
			if (!session.waitingForVacancy) return next()

			const query = ctx.message.text.trim()
			if (query.startsWith('/')) {
				return next()
			}
			MessageCleanupService.cleanupCommandFlow(ctx)
			if (!query) {
				await ctx.reply('Вакансия введена неверно!')
				return
			}

			await ctx.reply(`Ищу вакансии по запросу: ${query}`)

			updateSession(userId, {
				waitingForVacancy: false,
				lastSearchPage: 0,
				filters: { ...session.filters, keywords: query, userId: ctx.from.id },
			})
			await this.sendVacancies(ctx, next)
		})

		// Pagination handlers: previous and next page
	}

	public async sendVacancies(ctx: IBotContext, next: () => Promise<void>) {
		const session = await getAutoSession(ctx)
		const userId = session.userId!
		try {
			updateSession(userId, { isLoading: true })
			const filters = session.filters
			const page = filters.page ?? 0
			console.log(JSON.stringify(filters))

			const response = await this.multiparser.getVacancies(
				filters as SearchFilters,
			)
			this.bot.action('refresh', ctx => this.sendVacancies(ctx, next))

			if (response === null) {
				await ctx.reply(
					'Упс! Что-то пошло не так.n\GПопроюуйте ещё раз:',
					SearchFromCategoryKeyboard,
				)
				return
			}

			const { data, meta, success } = response as IParserVacancyResponse

			if (data.length == 0) {
				if (page === 0) {
					await ctx.reply(
						'По вашему запросу вакансий не найдено.\nПопробуйте ещё раз:',
						SearchFromCategoryKeyboard,
					)
					updateSession(userId, { waitingForVacancy: true })
				} else {
					await ctx.reply('Больше вакансий нет.')
				}
				return
			} else {
				await ctx.sendMessage(`Страница №${(page ?? 0) + 1}.`)
				updateSession(userId, { ...session, maxSearchPage: meta.totalPages })
				await VacancyDisplay.displayVacancies(ctx, response)
			}
			updateSession(userId, { isLoading: false })
		} catch (e) {
			updateSession(userId, { isLoading: false })
			console.error(e)
			await ctx.reply('Упс! Ошибка!')
		}
		updateSession(userId, { isLoading: false })
		await paginationMessage(ctx, next, this.bot, this.sendVacancies.bind(this))
	}
}
