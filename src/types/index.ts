export interface User {
  id: string
  email: string
  displayName?: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AIModel {
  id: string
  name: string
  displayName: string
  provider: string
  modelId: string
  isActive: boolean
  maxTokens: number
  temperature: number
  createdAt: string
  updatedAt: string
}

export interface Channel {
  id: string
  name: string
  description?: string
  allowedModels: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatSession {
  id: string
  userId: string
  channelId?: string
  title?: string
  modelId?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  modelId?: string
  tokensUsed: number
  createdAt: string
}

export interface UserPermission {
  id: string
  userId: string
  channelId?: string
  modelId?: string
  permissionType: 'allow' | 'deny'
  createdAt: string
}