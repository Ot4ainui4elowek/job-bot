import { Telegraf } from 'telegraf'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { IBotContext } from '../../context/context.interface'
import { getFiltersMessage } from '../../helpers/get-filters-message'
import { MessageCleanupService } from '../../helpers/message-cleanup-service'

export type Salary = {
	min?: number
	label: string
}

const salary: Salary[] = [
	{ min: 0, label: 'Не указана' },
	{ min: 5000, label: 'от 5,000 ₽' },
	{ min: 10000, label: 'от 10,000 ₽' },
	{ min: 20000, label: 'от 20,000 ₽' },
	{ min: 30000, label: 'от 30,000 ₽' },
]

export const editSalary = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	const session = await getAutoSession(ctx)
	const userId = session.userId!

	// Удаляем предыдущее сообщение бота (меню выбора другого фильтра)
	await MessageCleanupService.deleteLastBotMessage(ctx)

	// Отправляем меню выбора зарплаты
	const message = await ctx.reply('Выберите подходящий вариант зарплаты:', {
		reply_markup: {
			inline_keyboard: salary.map(s => [
				{ text: s.label, callback_data: `salary_${s.min}` },
			]),
		},
	})

	// Трекаем это сообщение как промежуточное
	await MessageCleanupService.trackFlowMessage(ctx, message.message_id)
	// Сохраняем как последнее сообщение бота
	updateSession(userId, { lastBotMessageId: message.message_id })

	bot.action(/salary_(\d+)/, async ctx => {
		const userId = ctx.from?.id
		if (!userId) return

		const salaryText = Number(ctx.match[1])
		let selectedSalary = salary.find(s => s.min === salaryText)

		if (selectedSalary == undefined) {
			await ctx.answerCbQuery('Зарплата введена неверно!')
			return
		}

		if (selectedSalary.min == 0) {
			selectedSalary.min = undefined
		}

		// Удаляем меню выбора зарплаты (с обработкой ошибок)
		try {
			await ctx.deleteMessage()
		} catch {}

		// Показываем временное подтверждение
		await MessageCleanupService.sendTemporary(
			ctx,
			`💰 Зарплата: ${selectedSalary.label}`,
			2000,
		)

		// Обновляем сессию и фильтры
		updateSession(userId, {
			awaitingFilter: undefined,
		})
		updateFilters(userId, {
			salary: selectedSalary,
		})

		// Возвращаем меню фильтров и сохраняем его ID
		const filtersMessage = await getFiltersMessage(ctx)

		// Сохраняем ID сообщения с информацией о фильтрах
		if (filtersMessage?.message_id) {
			updateSession(userId, { lastBotMessageId: filtersMessage.message_id })
		}
	})
}
