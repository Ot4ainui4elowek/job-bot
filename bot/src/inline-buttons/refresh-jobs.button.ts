import { ButtonLogic, TelegramButton } from './button.class'

const refreshLogic: ButtonLogic = {
	callback: async ctx => {
		ctx.session = ctx.session || {}
		if (!ctx.session.vacancyQuery) {
			await ctx.answerCbQuery('Нет предыдущего запроса.')
			return
		}
	},
}

export const RefreshJobsButton = new TelegramButton({
	logic: refreshLogic,
	text: 'Показать ещё',
})
