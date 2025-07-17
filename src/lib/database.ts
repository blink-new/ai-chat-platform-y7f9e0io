// Database initialization and table creation
import { blink } from '../blink/client'

export const initializeDatabase = async () => {
  try {
    // Create users table (extended from auth)
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create AI models table
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_id TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        max_tokens INTEGER DEFAULT 4000,
        temperature REAL DEFAULT 0.7,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create channels table
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        allowed_models TEXT, -- JSON array of model IDs
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create chat sessions table
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        channel_id TEXT,
        title TEXT,
        model_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (channel_id) REFERENCES channels(id),
        FOREIGN KEY (model_id) REFERENCES ai_models(id)
      )
    `)

    // Create chat messages table
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        model_id TEXT,
        tokens_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (model_id) REFERENCES ai_models(id)
      )
    `)

    // Create user permissions table
    await blink.db.sql(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        channel_id TEXT,
        model_id TEXT,
        permission_type TEXT NOT NULL CHECK (permission_type IN ('allow', 'deny')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (channel_id) REFERENCES channels(id),
        FOREIGN KEY (model_id) REFERENCES ai_models(id)
      )
    `)

    // Insert default models
    await blink.db.sql(`
      INSERT OR IGNORE INTO ai_models (id, name, display_name, provider, model_id, is_active, max_tokens, temperature)
      VALUES 
        ('gpt-4o-mini', 'gpt-4o-mini', 'GPT-4o Mini', 'openai', 'gpt-4o-mini', 1, 4000, 0.7),
        ('gpt-4o', 'gpt-4o', 'GPT-4o', 'openai', 'gpt-4o', 1, 4000, 0.7),
        ('claude-3-5-sonnet', 'claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 'claude-3-5-sonnet-20241022', 1, 4000, 0.7)
    `)

    // Insert default channels
    await blink.db.sql(`
      INSERT OR IGNORE INTO channels (id, name, description, allowed_models, is_active)
      VALUES 
        ('general', '通用聊天', '支持所有AI模型的通用聊天渠道', '["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet"]', 1),
        ('coding', '编程助手', '专门用于编程相关问题的渠道', '["gpt-4o", "claude-3-5-sonnet"]', 1),
        ('creative', '创意写作', '用于创意写作和内容创作的渠道', '["gpt-4o", "claude-3-5-sonnet"]', 1)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Helper functions for database operations
export const dbHelpers = {
  // Get user by ID or create if not exists
  async getOrCreateUser(authUser: any) {
    try {
      const user = await blink.db.users.list({
        where: { id: authUser.id },
        limit: 1
      })

      if (user.length === 0) {
        // Create new user
        const newUser = {
          id: authUser.id,
          email: authUser.email,
          displayName: authUser.displayName || authUser.email,
          role: authUser.email === 'admin@example.com' ? 'admin' : 'user',
          isActive: true
        }
        
        await blink.db.users.create(newUser)
        return newUser
      }

      return user[0]
    } catch (error) {
      console.error('Error getting/creating user:', error)
      return null
    }
  },

  // Get all active models
  async getActiveModels() {
    try {
      return await blink.db.aiModels.list({
        where: { isActive: "1" },
        orderBy: { displayName: 'asc' }
      })
    } catch (error) {
      console.error('Error getting active models:', error)
      return []
    }
  },

  // Get all active channels
  async getActiveChannels() {
    try {
      return await blink.db.channels.list({
        where: { isActive: "1" },
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      console.error('Error getting active channels:', error)
      return []
    }
  },

  // Create or get current session
  async getOrCreateSession(userId: string, channelId?: string, modelId?: string) {
    try {
      // Try to get the most recent session for this user
      const sessions = await blink.db.chatSessions.list({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        limit: 1
      })

      if (sessions.length > 0) {
        return sessions[0]
      }

      // Create new session
      const newSession = {
        id: `session_${Date.now()}`,
        userId,
        channelId: channelId || 'general',
        title: '新对话',
        modelId: modelId || 'gpt-4o-mini'
      }

      await blink.db.chatSessions.create(newSession)
      return newSession
    } catch (error) {
      console.error('Error getting/creating session:', error)
      return null
    }
  },

  // Save chat message
  async saveMessage(message: any) {
    try {
      await blink.db.chatMessages.create({
        id: message.id,
        sessionId: message.sessionId,
        userId: message.userId,
        role: message.role,
        content: message.content,
        modelId: message.modelId,
        tokensUsed: message.tokensUsed || 0
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  },

  // Get session messages
  async getSessionMessages(sessionId: string) {
    try {
      return await blink.db.chatMessages.list({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
      })
    } catch (error) {
      console.error('Error getting session messages:', error)
      return []
    }
  },

  // Get user sessions
  async getUserSessions(userId: string) {
    try {
      return await blink.db.chatSessions.list({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      })
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return []
    }
  }
}