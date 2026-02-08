import { getSessionFromId, updateSession } from '../context/context.entity'
import { IBotContext } from '../context/context.interface'

export class MessageCleanupService {
	// Удаляем все сообщения в текущем "потоке" команды
	static async cleanupCommandFlow(ctx: IBotContext) {
		const userId = ctx.from?.id
		if (!userId) return

		const session = getSessionFromId(userId)
		const flowMessages = session?.commandFlowMessages || []

		for (const msgId of flowMessages) {
			try {
				await ctx.deleteMessage(msgId)
			} catch {}
		}

		updateSession(userId, { commandFlowMessages: [] })
	}

	// Трекаем сообщение как часть текущего потока
	static async trackFlowMessage(ctx: IBotContext, messageId: number) {
		const userId = ctx.from?.id
		if (!userId) return

		const session = getSessionFromId(userId)
		const flowMessages = session?.commandFlowMessages || []
		flowMessages.push(messageId)

		updateSession(userId, { commandFlowMessages: flowMessages })
	}

	// Удаляем предыдущее меню и сообщение бота
	static async replaceMessage(ctx: IBotContext, text: string, keyboard?: any) {
		const userId = ctx.from?.id
		if (!userId) return

		const session = getSessionFromId(userId)
		const lastBotMsgId = session?.lastBotMessageId
		const userMsgId = ctx.message?.message_id

		// Удаляем предыдущее сообщение бота
		if (lastBotMsgId) {
			try {
				await ctx.deleteMessage(lastBotMsgId)
			} catch {}
		}

		// Удаляем сообщение пользователя (кнопку)
		if (userMsgId) {
			try {
				await ctx.deleteMessage(userMsgId)
			} catch {}
		}

		// Отправляем новое
		const message = await ctx.reply(text, keyboard)
		updateSession(userId, { lastBotMessageId: message.message_id })

		return message
	}

	// Удаляем только последнее сообщение бота
	static async deleteLastBotMessage(ctx: IBotContext) {
		const userId = ctx.from?.id
		if (!userId) return

		const session = getSessionFromId(userId)
		const lastBotMsgId = session?.lastBotMessageId

		if (lastBotMsgId) {
			try {
				await ctx.deleteMessage(lastBotMsgId)
			} catch {}
		}

		updateSession(userId, { lastBotMessageId: undefined })
	}

	// Показываем временное сообщение с автоудалением
	static async sendTemporary(
		ctx: IBotContext,
		text: string,
		deleteAfter = 2000,
	) {
		const message = await ctx.reply(text)

		setTimeout(async () => {
			try {
				await ctx.deleteMessage(message.message_id)
			} catch {}
		}, deleteAfter)

		return message
	}
}
