export const formatObjectsToStrings = <T extends Record<string, any>>(
	filters: T,
	formatter?: (value: any) => string,
): string[] => {
	const defaultFormatter = (v: any) => v.toString()
	const formatFn = formatter || defaultFormatter

	return Object.values(filters).map(formatFn)
}
