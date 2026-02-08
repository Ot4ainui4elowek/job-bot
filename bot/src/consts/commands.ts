export const $commands = {
	search: 'search',
	start: 'start',
	filters: 'filters',
	help: 'help',
} as const
export type CommandKey = keyof typeof $commands
export type CommandValue = (typeof $commands)[CommandKey]
