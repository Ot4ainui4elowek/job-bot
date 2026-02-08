// Сообщение пользователя или системы
export interface IOllamaMessage {
	id?: string // иногда может отсутствовать
	role: 'user' | 'assistant' | 'system'
	content: string
}

// Стандартный ответ без потоков
export interface IOllamaChatResponse {
	output: IOllamaMessage[]
}

// Тип элемента потока при stream: true
export interface IOllamaStreamEvent {
	type: 'message' | 'error' | 'done'
	message?: IOllamaMessage // есть только если type === 'message'
	error?: string // есть только если type === 'error'
}
