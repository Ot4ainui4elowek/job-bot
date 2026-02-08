export interface AreaLocation {
	id: string
	parent_id: string | null
	name: string
	areas: AreaLocation[]
	utc_offset?: string
	lat?: number
	lng?: number
}

export interface AreasResponse {
	id: string
	parent_id: null
	name: string
	areas: AreaLocation[]
}
