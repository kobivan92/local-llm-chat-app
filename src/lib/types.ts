export type FileAttachment = {
  id: string
  name: string
  type: string
  size: number
  data: string
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: FileAttachment[]
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
  model: ModelType
  createdAt: number
  updatedAt: number
}

export type ModelType = 'gpt-4o' | 'gpt-4o-mini'

export const MODELS: { value: ModelType; label: string; description: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Most capable model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Faster, efficient model' },
]
