export const searchingType = {
	category: 'category',
	title: 'title',
} as const
export type SerchingType = (typeof searchingType)[keyof typeof searchingType]

const locationType = {
	md: 'moldova',
	abroad: 'abroad',
} as const
export type LocationType = (typeof locationType)[keyof typeof locationType]
