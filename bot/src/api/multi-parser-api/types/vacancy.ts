// export type IParserVacancy = {
// 	id: string
// 	title: string
// 	company?: string
// 	salary?: string
// 	location?: string
// 	description?: string
// 	fullDescription?: string // Полное описание с детальной страницы
// 	url: string
// 	publishedAt?: Date
// 	education?: string
// 	experience?: string
// 	schedule?: string
// 	workPlace?: string
// 	source: 'rabota.md' | '999.md' | 'makler.md' | 'other'
// 	// Дополнительные поля для 999.md
// 	author?: string // Автор (Физ. или Юр. лицо)
// 	seasonal?: boolean // Сезонная работа
// 	employmentType?: string // Тип занятости
// 	companyType?: string // Тип компании
// 	languages?: string[] // Языки
// 	contactPerson?: string // Контактное лицо
// 	region?: string // Регион (полный адрес)
// 	// Дополнительные поля для makler.md
// 	vacancyType?: string // Тип вакансии (Прямая/Агентство)
// 	industry?: string // Сферы деятельности
// 	specialization?: string // Специализация
// 	// Поля для отслеживания актуальности
// 	firstSeenAt?: Date | string // Когда впервые найдена
// 	lastSeenAt?: Date | string // Когда найдена в последний раз
// 	isActive?: boolean // Активна ли сейчас
// }
export interface IParserVacancy {
	id: string
	title: string
	company?: string
	salary?: string
	location?: string
	description?: string
	fullDescription?: string // Полное описание с детальной страницы
	url: string
	publishedAt?: Date
	education?: string
	experience?: string
	schedule?: string
	skills?: string[]
	workPlace?: string
	source: 'rabota.md' | '999.md' | 'makler.md' | 'hh.ru' | 'other'
	// Дополнительные поля для 999.md
	author?: string // Автор (Физ. или Юр. лицо)
	seasonal?: boolean // Сезонная работа
	employmentType?: string // Тип занятости
	companyType?: string // Тип компании
	languages?: string[] // Языки
	contactPerson?: string // Контактное лицо
	region?: string // Регион (полный адрес)
	// Дополнительные поля для makler.md
	vacancyType?: string // Тип вакансии (Прямая/Агентство)
	industry?: string // Сферы деятельности
	specialization?: string // Специализация
	workLocationType?: 'moldova' | 'abroad' | 'international' // Тип локации (внутри страны или за границей)
	// Поля для категоризации через словарики (гибридная схема)
	category?: string // Каноническое название профессии для быстрого поиска
	professionDictionaryIds?: string[] // Ссылки на словарики источников
	// Поля для отслеживания актуальности
	firstSeenAt?: Date | string // Когда впервые найдена
	lastSeenAt?: Date | string // Когда найдена в последний раз
	isActive?: boolean // Активна ли сейчас
}

export interface RawData {
	industry?: string
	education?: string
	vacancyType?: string
	specialization?: string
	[key: string]: unknown // для дополнительных полей
}
