// helpers/vacancy-display.ts
import { Markup } from 'telegraf'
import { IParserVacancyResponse } from '../api/multi-parser-api/types/vacancy.response'
import { getAutoSession, updateSession } from '../context/context.entity'
import { IBotContext } from '../context/context.interface'
import { VacancyTextConstructorParser } from './parser-vacancy-text-constructor'
export interface VacancyDisplayOptions {
	/** Показывать ли кнопку "Попробовать ещё раз" при ошибке */
	showRetryButton?: boolean
	/** Callback для кнопки retry */
	onRetry?: (ctx: IBotContext) => Promise<void>
	/** Показывать ли пагинацию */
	showPagination?: boolean
	/** Callback для пагинации */
	onPaginate?: (ctx: IBotContext) => Promise<void>
}

export class VacancyDisplay {
	/**
	 * Отображение вакансий с пагинацией
	 */
	static async displayVacancies(
		ctx: IBotContext,
		result: IParserVacancyResponse | null,
		options: VacancyDisplayOptions = {},
	): Promise<void> {
		const {
			showRetryButton = true,
			onRetry,
			showPagination = true,
			onPaginate,
		} = options

		try {
			const session = await getAutoSession(ctx)
			const userId = session.userId!

			// Если ошибка получения данных
			if (result === null) {
				if (showRetryButton && onRetry) {
					await ctx.reply(
						'Упс! Что-то пошло не так',
						Markup.inlineKeyboard([
							Markup.button.callback('Попробовать ещё раз', 'retry_search'),
						]),
					)
				} else {
					await ctx.reply('Упс! Что-то пошло не так')
				}
				return
			}

			const { data, meta } = result
			const currentPage = meta.currentPage

			// Если вакансий не найдено
			if (data.length === 0) {
				if (currentPage === 0) {
					await ctx.reply(
						'По вашему запросу вакансий не найдено.\nПопробуйте изменить фильтры или ввести другой запрос.',
					)
					updateSession(userId, { waitingForVacancy: true })
				} else {
					await ctx.reply('Больше вакансий нет.')
				}
				return
			}

			// Показываем номер страницы

			// Сохраняем метаданные
			updateSession(userId, { maxSearchPage: meta.totalPages })

			// Отображаем вакансии
			for (const vacancy of data) {
				const text = VacancyTextConstructorParser(vacancy)
				await ctx.reply(text, {
					link_preview_options: { is_disabled: true },
				})
			}

			// Показываем пагинацию
			if (showPagination && onPaginate) {
				await this.displayPagination(ctx, meta)
			}
		} catch (error) {
			console.error('Error displaying vacancies:', error)
			await ctx.reply('Упс! Произошла ошибка при отображении вакансий.')
		}
	}

	/**
	 * Отображение кнопок пагинации
	 */
	private static async displayPagination(
		ctx: IBotContext,
		meta: { currentPage: number; totalPages: number },
	): Promise<void> {
		const buttons = []

		// Кнопка "Назад"
		if (meta.currentPage > 0) {
			buttons.push(Markup.button.callback('⬅️ Назад', `page_prev`))
		}

		// Информация о странице
		buttons.push(
			Markup.button.callback(
				`${meta.currentPage + 1}/${meta.totalPages}`,
				'page_info',
			),
		)

		// Кнопка "Вперёд"
		if (meta.currentPage < meta.totalPages - 1) {
			buttons.push(Markup.button.callback('Вперёд ➡️', `page_next`))
		}

		await ctx.reply('Выберите действие:', Markup.inlineKeyboard([buttons]))
	}
}
