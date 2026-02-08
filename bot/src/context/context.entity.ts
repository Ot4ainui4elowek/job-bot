import { IHHVacancy } from '../api/hh.ru/types'
import { IBotContext, SessionData } from './context.interface'

export const sessions = new Map<number, SessionData>()

function createDefaultSession(): SessionData {
	return {
		isLoading: false,
		waitingForSpeciality: false,
		waitingForVacancy: false,
		filters: { limit: 3 },
		lastSearchResults: [],
		lastSearchPage: 0,
		maxSearchPage: undefined,
		savedVacancies: [],
		vacancyQuery: '',
		awaitingFilter: undefined,
		searchResults: undefined,
	}
}
export const getAutoSession = async (
	ctx: IBotContext,
): Promise<SessionData> => {
	const userId = ctx.from?.id

	const session = getSessionFromId(userId!)
	return { ...session, userId: userId }
}

export function getSessionFromId(userId: number): SessionData {
	if (!sessions.has(userId)) {
		sessions.set(userId, createDefaultSession())
	}
	return sessions.get(userId)!
}
export function updateSession(
	userId: number,
	updates: Partial<SessionData>,
): SessionData {
	const session = getSessionFromId(userId)
	const updated = { ...session, ...updates }
	sessions.set(userId, updated)
	return updated
}

// Обновить фильтры
export function updateFilters(
	userId: number,
	filters: Partial<SessionData['filters']>,
): SessionData {
	const session = getSessionFromId(userId)
	session.filters = { ...session.filters, ...filters }
	sessions.set(userId, session)
	return session
}

// Очистить сессию
export function clearSession(userId: number): void {
	sessions.set(userId, createDefaultSession())
}

// Удалить сессию
export function deleteSession(userId: number): void {
	sessions.delete(userId)
}

// Сбросить результаты поиска
export function resetSearch(userId: number): void {
	const session = getSessionFromId(userId)
	session.lastSearchResults = []
	session.lastSearchPage = 0
	session.maxSearchPage = undefined
	session.vacancyQuery = ''
	sessions.set(userId, session)
}

// Добавить сохраненную вакансию
export function saveVacancy(userId: number, vacancy: IHHVacancy): void {
	const session = getSessionFromId(userId)
	if (!session.savedVacancies.find(v => v.id === vacancy.id)) {
		session.savedVacancies.push(vacancy)
		sessions.set(userId, session)
	}
}

// Удалить сохраненную вакансию
export function unsaveVacancy(userId: number, vacancyId: string): void {
	const session = getSessionFromId(userId)
	session.savedVacancies = session.savedVacancies.filter(
		v => v.id !== vacancyId,
	)
	sessions.set(userId, session)
}

// Получить все сохраненные вакансии
export function getSavedVacancies(userId: number): IHHVacancy[] {
	return getSessionFromId(userId).savedVacancies
}

// Проверить существование сессии
export function hasSession(userId: number): boolean {
	return sessions.has(userId)
}

// Получить количество активных сессий
export function getSessionCount(): number {
	return sessions.size
}

// Очистить все сессии (для отладки)
export function clearAllSessions(): void {
	sessions.clear()
}
