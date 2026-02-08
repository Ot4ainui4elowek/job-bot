import { Telegraf } from 'telegraf'
import { IBotContext } from '../../context/context.interface'
import { createFilterSelector } from './create-filter-selector'
import { CURRENCIES } from '../../api/multi-parser-api/types/filters-dictionary'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { Currency } from '../../api/multi-parser-api/types/filters-dictionary'

export const editCurrency = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	await createFilterSelector(ctx, bot, {
		filterName: 'currency',
		title: 'Выберите валюту:',
		dictionary: CURRENCIES,
		errorMessage: 'Валюта введена неверно',
		onSelect: async (selectedKey, ctx) => {
			const session = await getAutoSession(ctx)
			
			updateSession(session.userId!, {
				awaitingFilter: undefined,
				searchResults: undefined,
			})
			
			updateFilters(session.userId!, {
				currency: selectedKey as Currency,
			})
		},
	})
}
