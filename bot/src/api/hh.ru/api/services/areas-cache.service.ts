import { AreaLocation, AreasResponse } from '../../types/region.interface'

export class AreasCache {
	private static instance: AreasCache | null = null
	private areas: AreaLocation[] = []
	private allAreasFlat: (AreaLocation & { level: number })[] = []

	private constructor() {}

	static getInstance(): AreasCache {
		if (!AreasCache.instance) {
			AreasCache.instance = new AreasCache()
		}
		return AreasCache.instance
	}

	/**
	 * Инициализирует кэш с данными от API
	 * @param data данные от HH API /areas эндпоинта
	 */
	initialize(data: AreasResponse[]): void {
		this.areas = []
		this.allAreasFlat = []

		for (const country of data) {
			this.areas.push(...country.areas)
			this._flattenAreas(country.areas, 0)
		}
	}

	/**
	 * Рекурсивно разворачивает иерархию регионов в плоский список
	 */
	private _flattenAreas(areas: AreaLocation[], level: number): void {
		for (const area of areas) {
			this.allAreasFlat.push({ ...area, level })
			if (area.areas && area.areas.length > 0) {
				this._flattenAreas(area.areas, level + 1)
			}
		}
	}

	/**
	 * Ищет регионы по названию (case-insensitive)
	 * @param query строка для поиска
	 * @param limit максимальное количество результатов
	 * @returns массив найденных регионов
	 */
	searchByName(query: string, limit: number = 10): AreaLocation[] {
		const lowerQuery = query.toLowerCase().trim()
		if (lowerQuery.length === 0) return []

		return this.allAreasFlat
			.filter(area => area.name.toLowerCase().includes(lowerQuery))
			.slice(0, limit)
			.map(({ level, ...area }) => area)
	}

	/**
	 * Получает регион по ID
	 */
	getById(id: string): AreaLocation | undefined {
		return this.allAreasFlat.find(area => area.id === id)
	}

	/**
	 * Получает все регионы верхнего уровня (страны/федеральные округа)
	 */
	getRootAreas(): AreaLocation[] {
		return this.areas
	}

	/**
	 * Получает все регионы
	 */
	getAllAreas(): AreaLocation[] {
		return this.allAreasFlat.map(({ level, ...area }) => area)
	}

	/**
	 * Проверяет, инициализирован ли кэш
	 */
	isInitialized(): boolean {
		return this.areas.length > 0
	}

	/**
	 * Очищает кэш
	 */
	clear(): void {
		this.areas = []
		this.allAreasFlat = []
	}
}

export const areasCache = AreasCache.getInstance()
