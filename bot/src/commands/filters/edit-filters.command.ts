import { Telegraf } from 'telegraf'
import { filters } from '../../api/hh.ru/types'
import { updateSession } from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersText } from '../../helpers/get-filters-message'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'
import {
	clearFilters,
	getFilterKeyboard,
} from '../../inline-buttons/filter-buttons'
import { SearchButton } from '../../inline-buttons/search.button'
import { Command } from '../command.class'
import { StartHears, StartKeyboard } from '../start.command'
import { editEmployment } from './edit-employment'
import { editExperience } from './edit-experience'
import { editPerPage } from './edit-per-page'
import { editSalary } from './edit-salary'

type FilterKey = keyof typeof filters

export class EditFiltersCommand extends Command {
	constructor(bot: Telegraf<IBotContext>) {
		super(bot)
	}

	handle(): void {
		Object.entries(filters).forEach(([key, label]) => {
			this.bot.hears(label, async ctx => {
				const userId = ctx.from.id

				// Удаляем сообщение с кнопкой
				try {
					await ctx.deleteMessage()
				} catch {}

				updateSession(userId, { awaitingFilter: key as FilterKey })

				switch (key as FilterKey) {
					case 'salary': {
						await editSalary(ctx, this.bot)
						break
					}
					case 'experience': {
						await editExperience(ctx, this.bot)
						break
					}
					case 'employment': {
						await editEmployment(ctx, this.bot)
						break
					}
					case 'back': {
						// Очищаем поток фильтров
						await MessageCleanupService.cleanupCommandFlow(ctx)

						const message = await ctx.reply(
							'Выберите дальнейшее действие:',
							StartKeyboard,
						)
						updateSession(userId, { lastBotMessageId: message.message_id })
						break
					}
					case 'per_page': {
						await editPerPage(ctx, this.bot)
						break
					}
					case 'delete': {
						await clearFilters(ctx)
						// В конце каждого onSelect callback:

						// Возвращаем меню фильтров и сохраняем его ID

						break
					}
				}
			})
		})

		this.bot.hears('❌ СБРОСИТЬ ФИЛЬТРЫ', async ctx => {
			const userId = ctx.from.id

			// Удаляем кнопку
			try {
				await ctx.deleteMessage()
			} catch {}

			// Показываем временное подтверждение
			await MessageCleanupService.sendTemporary(
				ctx,
				'✅ Фильтры успешно сброшены',
			)

			// Возвращаем меню фильтров
			const message = await ctx.reply(
				'Выберите, что хотите изменить:\n' + (await getFiltersText(ctx)),
				getFilterKeyboard(),
			)

			updateSession(userId, { lastBotMessageId: message.message_id })
		})

		this.bot.hears(StartHears.filters, async ctx => {
			const userId = ctx.from.id

			// Очищаем предыдущие сообщения
			await MessageCleanupService.cleanupCommandFlow(ctx)

			// Удаляем кнопку "Фильтры"
			try {
				await ctx.deleteMessage()
			} catch {}

			SearchButton.bindLogic(this.bot, [
				async ctx => {
					await ctx.deleteMessage()
				},
			])

			const message = await ctx.reply(
				'Выберите, что хотите изменить:\n' + (await getFiltersText(ctx)),
				getFilterKeyboard(),
			)

			updateSession(userId, {
				lastBotMessageId: message.message_id,
				commandFlowMessages: [],
			})
		})
	}
}
