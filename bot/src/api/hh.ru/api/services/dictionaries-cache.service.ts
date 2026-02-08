// import { AxiosInstance } from 'axios'
// import fs from 'fs'
// import cron from 'node-cron'
// import path from 'path'
// import { IDictionaries } from '../../types/dictionary'

// export class DictoinariesService {
// 	private static instance: DictoinariesService | null = null
// 	private CACHE_FILE = path.join(__dirname, 'dictionary_cache.json')
// 	private UPDATE_INTERVAL = '0 6 * * *' // 1 день
// 	private static cacheInitialized = false

// 	// приватный конструктор — запрещаем создавать экземпляры извне
// 	private constructor(private readonly hhApi: AxiosInstance) {}

// 	// публичный метод для получения синглтона
// 	public static getInstance(hhApi: AxiosInstance): DictoinariesService {
// 		if (!DictoinariesService.instance) {
// 			DictoinariesService.instance = new DictoinariesService(hhApi)
// 			DictoinariesService.instance.init() // инициализация при первом создании
// 		}
// 		return DictoinariesService.instance
// 	}

// 	// инициализация кэша и расписания
// 	private async init() {
// 		console.log('[DICTIONARIES]:DICTIONARIES SERVICE INIT')
// 		await this.updateCache() // обновляем при старте
// 		this.scheduleDailyUpdate() // и потом ежедневно
// 	}

// 	// метод обновления кэша
// 	private async updateCache() {
// 		try {
// 			console.log('[CACHE] Updating…')
// 			const { data } = await this.hhApi.get('/dictionaries')
// 			fs.writeFileSync(
// 				this.CACHE_FILE,
// 				JSON.stringify({ timestamp: Date.now(), json: data }, null, 2),
// 			)
// 			console.log('[CACHE] Updated!')
// 		} catch (error) {
// 			console.error('[CACHE] Update failed:', error)
// 		}
// 	}

// 	// ежедневное обновление через cron
// 	private scheduleDailyUpdate() {
// 		cron.schedule('26 18 * * *', () => {
// 			this.updateCache()
// 		})
// 	}

// 	// статический метод для получения данных из кэша
// 	public static getCache(): IDictionaries | null {
// 		const fileName = path.join(__dirname, 'dictionary_cache.json')
// 		if (!fs.existsSync(fileName)) return null
// 		const stored = JSON.parse(fs.readFileSync(fileName, 'utf8'))
// 		return stored.json as IDictionaries
// 	}
// }
