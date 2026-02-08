import { ButtonLogic, TelegramButton } from './button.class'

const searchLogic: ButtonLogic = {
	callback: async ctx => {
		ctx.session = ctx.session || {}
		ctx.session.waitingForVacancy = true
		await ctx.reply('Введите название вакансии, которую хотите найти:')
	},
}

export const SearchButton = new TelegramButton({
	logic: searchLogic,
	text: 'Найти вакансию',
})
