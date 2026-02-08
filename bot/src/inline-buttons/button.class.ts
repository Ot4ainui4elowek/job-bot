// TelegramButton.ts
// или другой фреймворк

import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/types'
import { IBotContext } from '../context/context.interface'

export interface ButtonCommand {
	commandName: string
	command: (ctx: IBotContext) => void
}
export interface ButtonLogic {
	callback?: (ctx: IBotContext) => void
	command?: ButtonCommand // для inline кнопок
	// для обычных команд
}
export interface TelegramButtonArgs {
	text: string

	logic: ButtonLogic
}

export class TelegramButton {
	private text: string
	private logic: ButtonLogic

	constructor({ text, logic }: TelegramButtonArgs) {
		this.text = text
		this.logic = logic
	}

	// Создаем inline кнопку для клавиатуры
	public inlineButton(text?: string): InlineKeyboardButton {
		return {
			text: text ?? this.text,
			callback_data: this.text, // можно заменить на id или hash
		}
	}

	// Метод для привязки логики
	public bindLogic(
		bot: Telegraf<IBotContext>,
		anyComands?: ((ctx: IBotContext) => void)[]
	) {
		if (this.logic.callback) {
			const callback = (ctx: IBotContext, logic: ButtonLogic) => {
				if (logic.callback) {
					logic.callback(ctx)
				}
				if (anyComands) {
					for (const command of anyComands) {
						command(ctx)
					}
				}
			}
			bot.action(this.text, ctx => callback(ctx, this.logic))
		}

		if (this.logic.command) {
			bot.command(this.logic.command.commandName, this.logic.command.command)
		}
	}
}
