import { Telegraf } from 'telegraf'
import { IBotContext } from '../../context/context.interface'
import { createFilterSelector } from './create-filter-selector'
import { SCHEDULE_TYPES } from '../../api/multi-parser-api/types/filters-dictionary'
import {
	getAutoSession,
	updateFilters,
	updateSession,
} from '../../context/context.entity'
import { ScheduleType } from '../../api/multi-parser-api/types/filters-dictionary'

export const editSchedule = async (
	ctx: IBotContext,
	bot: Telegraf<IBotContext>,
) => {
	await createFilterSelector(ctx, bot, {
		filterName: 'schedule',
		title: 'Выберите график работы:',
		dictionary: SCHEDULE_TYPES,
		errorMessage: 'График работы введен неверно',
		onSelect: async (selectedKey, ctx) => {
			const session = await getAutoSession(ctx)
			
			updateSession(session.userId!, {
				awaitingFilter: undefined,
				searchResults: undefined,
			})
			
			updateFilters(session.userId!, {
				schedule: selectedKey as ScheduleType,
			})
		},
	})
}
