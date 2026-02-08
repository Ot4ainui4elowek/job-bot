import { session, Telegraf, TelegramError } from 'telegraf'
import { MultiParserApi } from './api/multi-parser-api/api/api'
import { Command } from './commands/command.class'
import { ErrorCommand } from './commands/error.command'
import { EditFiltersCommand } from './commands/filters/edit-filters.command'
import { HelpCommand } from './commands/help.command'
import { SearchCommand } from './commands/search/search.command'
import { StartCommand } from './commands/start.command'
import { IConfigService } from './config/config.interface'
import { ConfigService } from './config/config.service'
import { IBotContext } from './context/context.interface'
require('dotenv').config()

class Bot {
	bot: Telegraf<IBotContext>
	commands: Command[] = []
	constructor(private readonly configService: IConfigService) {
		this.bot = new Telegraf<IBotContext>(configService.get('BOT_TOKEN'))
		this.bot.use(session())
	}

	async init() {
		// Инициализируем кэш регионов при старте бота
		try {
			let multiParserApi: MultiParserApi
			try {
				multiParserApi = new MultiParserApi(
					this.configService.get('MULTI_PARSER_URL'),
				)
			} catch (error) {
				throw new Error('Failed to initialize HHClient: ' + error)
			}

			this.commands = [
				new ErrorCommand(this.bot),
				new StartCommand(this.bot),
				new SearchCommand(this.bot, multiParserApi),
				new EditFiltersCommand(this.bot),
				new HelpCommand(this.bot),
			]
			for (const command of this.commands) {
				command.handle()
			}
		} catch (error) {
			console.error('❌ Failed to initialize areas cache:', error)
		}

		this.bot.launch()

		this.bot.catch((err, ctx) => {
			console.error('Bot error:', err)
			const error = err as TelegramError
			if (error.response?.error_code === 403) {
				console.log(`User ${ctx.chat?.id} has blocked the bot`)
				// Optionally: update user status in database
				return
			}

			// Handle other errors
			console.error('Unhandled error:', err)
		})
	}
}

const bot = new Bot(new ConfigService())
bot.init().catch(console.error)
