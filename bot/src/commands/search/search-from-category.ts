import { Markup, Telegraf } from 'telegraf'
import { $parserApi } from '../../api/multi-parser-api/api/api'
import { IParserVacancyResponse } from '../../api/multi-parser-api/types/vacancy.response'
import { CANONICAL_PROFESSION_NAMES } from '../../consts/canonical-array'
import {
	getAutoSession,
	getSessionFromId,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { VacancyService } from '../../helpers/get-vacancies'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'
import { VacancyDisplay } from '../../helpers/send-vacancies-message'
import paginationMessage from '../../inline-buttons/pagination-msg'
const category = 'search-from-category'
export const SearchFromCategoryKeyboard = Markup.inlineKeyboard([
	Markup.button.callback('🗂 Выбрать категорию', category),
])

export const SearchFromCategory = async (
	bot: Telegraf<IBotContext>,
	vacanciesServise: VacancyService,
) => {
	// Константы для пагинации
	const ITEMS_PER_PAGE = 10

	// Функция для создания клавиатуры с пагинацией
	const createCategoryKeyboard = (page: number = 0) => {
		const totalPages = Math.ceil(
			CANONICAL_PROFESSION_NAMES.length / ITEMS_PER_PAGE,
		)
		const start = page * ITEMS_PER_PAGE
		const end = start + ITEMS_PER_PAGE
		const currentCategories = CANONICAL_PROFESSION_NAMES.slice(start, end)

		const buttons = currentCategories.map((category, index) => {
			const globalIndex = start + index // Глобальный индекс в массиве
			return [Markup.button.callback(category, `cat_${globalIndex}`)]
		})

		// Кнопки навигации
		const navigationButtons = []

		if (page > 0) {
			navigationButtons.push(
				Markup.button.callback('⬅️ Назад', `catpg_${page - 1}`),
			)
		}

		navigationButtons.push(
			Markup.button.callback(`📄 ${page + 1}/${totalPages}`, 'catpg_info'),
		)

		if (page < totalPages - 1) {
			navigationButtons.push(
				Markup.button.callback('Вперёд ➡️', `catpg_${page + 1}`),
			)
		}

		if (navigationButtons.length > 0) {
			buttons.push(navigationButtons)
		}

		// Кнопка отмены
		buttons.push([Markup.button.callback('❌ Отменить', 'cat_cancel')])

		return Markup.inlineKeyboard(buttons)
	}

	// В обработчике
	bot.action(category, async ctx => {
		ctx.deleteMessage()
		const userId = ctx.from?.id

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя')
			return
		}
		updateSession(userId, { waitingForVacancy: false })
		updateFilters(userId, { page: 0 })

		// Удаляем предыдущее сообщение бота
		await MessageCleanupService.deleteLastBotMessage(ctx)

		const message = await ctx.reply(
			'Выберите категорию для поиска вакансий:',
			createCategoryKeyboard(0),
		)
		await MessageCleanupService.trackFlowMessage(ctx, message.message_id)

		// Сохраняем ID сообщения
	})
	const sendVacancies = async (ctx: IBotContext, next: () => Promise<void>) => {
		const session = await getAutoSession(ctx)
		const userId = session.userId!
		try {
			updateSession(userId, { isLoading: true })

			let filters = session.filters
			const page = filters.page ?? 0
			console.log(JSON.stringify(filters))
			const response = await $parserApi.getVacancies(filters)
			filters = getSessionFromId(userId).filters
			bot.action('refresh', ctx => vacanciesServise.fetchVacancies(filters))

			if (response == null) {
				await ctx.reply('Упс! Что-то пошло не так')
				next()
			}

			const { data, meta, success } = response as IParserVacancyResponse

			if (data.length == 0) {
				if (page === 0) {
					await ctx.reply(
						'По вашему запросу вакансий не найдено.\nПопробуйте ещё раз:',
						SearchFromCategoryKeyboard,
					)
					updateSession(userId, { waitingForVacancy: true })
					await MessageCleanupService.cleanupCommandFlow(ctx)
					next()
				} else {
					await ctx.reply('Больше вакансий нет.')
				}
			} else {
				await MessageCleanupService.cleanupCommandFlow(ctx)
				await ctx.sendMessage(`Страница №${(page ?? 0) + 1}.`)
				;(updateSession(userId, { ...session, maxSearchPage: meta.totalPages }),
					updateFilters(userId, { page: page }))
				await VacancyDisplay.displayVacancies(ctx, response)
				await paginationMessage(ctx, next, bot, sendVacancies)
			}
			updateSession(userId, { isLoading: false })
		} catch (e) {
			updateSession(userId, { isLoading: false })
			console.error(e)
			await ctx.reply('Упс! Ошибка!')
		}
		MessageCleanupService
		updateSession(userId, { isLoading: false })
	}

	// Обработчик выбора категории (по индексу)
	bot.action(/^cat_(\d+)$/, async (ctx, next) => {
		const userId = ctx.from?.id
		if (!userId) return

		const categoryIndex = parseInt(ctx.match[1])
		const category = CANONICAL_PROFESSION_NAMES[categoryIndex]

		if (!category) {
			await ctx.answerCbQuery('❌ Категория не найдена')
			return
		}

		// Показываем временное подтверждение с кнопкой отмены
		const searchingMessage = await ctx.reply(
			`🔍 Ищу вакансии в категории: ${category}`,
		)
		await MessageCleanupService.trackFlowMessage(
			ctx,
			searchingMessage.message_id,
		)

		// Обновляем фильтры и запускаем поиск
		updateFilters(userId, { keywords: category })
		const filters = getSessionFromId(userId).filters
		try {
			await sendVacancies(ctx, next)

			MessageCleanupService.deleteLastBotMessage(ctx)
			// await paginationMessage(ctx, bot, sendVacancies.bind(this))
		} catch {
			await ctx.reply('Ошибка запроса')
		}

		// Здесь отправляем запрос на поиск вакансий
		// await searchVacancies(ctx, userId)
	})

	// Обработчик кнопки отмены
	bot.action('cat_cancel', async ctx => {
		const userId = ctx.from?.id
		if (!userId) return

		try {
			await ctx.deleteMessage()
		} catch {}

		await MessageCleanupService.sendTemporary(ctx, '❌ Поиск отменён', 2000)

		await ctx.answerCbQuery()
	})

	// Обработчик пагинации
	bot.action(/^catpg_(\d+)$/, async ctx => {
		const userId = ctx.from?.id
		if (!userId) return

		const page = parseInt(ctx.match[1])

		// Обновляем сообщение с новой страницей
		try {
			await ctx.editMessageText(
				'Выберите категорию для поиска вакансий:',
				createCategoryKeyboard(page),
			)

			// Сохраняем текущую страницу
			updateSession(userId, { currentCategoryPage: page })

			await ctx.answerCbQuery()
		} catch (error) {
			// Игнорируем ошибки
			await ctx.answerCbQuery()
		}
	})

	// Обработчик для кнопки с текущей страницей (ничего не делает)
	bot.action('catpg_info', async ctx => {
		await ctx.answerCbQuery()
	})
}
