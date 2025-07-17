import { useState, useEffect, useRef } from 'react'
import { User, ChatMessage, AIModel, Channel, ChatSession } from '../types'
import { blink } from '../blink/client'
import { dbHelpers } from '../lib/database'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  MessageSquare, 
  Send, 
  Settings, 
  LogOut, 
  Bot, 
  User as UserIcon,
  Sparkles,
  Zap,
  Download,
  Trash2,
  Copy,
  Plus,
  History,
  Edit3,
  MoreVertical
} from 'lucide-react'

interface ChatInterfaceProps {
  user: User
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [selectedChannel, setSelectedChannel] = useState('general')
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([])
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load models and channels from database
        const [models, channels] = await Promise.all([
          dbHelpers.getActiveModels(),
          dbHelpers.getActiveChannels()
        ])

        setAvailableModels(models)
        setAvailableChannels(channels)

        // Load user sessions
        const userSessions = await dbHelpers.getUserSessions(user.id)
        setSessions(userSessions)

        // Get or create current session
        const session = await dbHelpers.getOrCreateSession(user.id, selectedChannel, selectedModel)
        if (session) {
          setCurrentSession(session)
          
          // Load session messages
          const sessionMessages = await dbHelpers.getSessionMessages(session.id)
          setMessages(sessionMessages.map(msg => ({
            ...msg,
            tokensUsed: msg.tokensUsed || 0
          })))
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    if (user?.id) {
      loadInitialData()
    }
  }, [user?.id, selectedChannel, selectedModel])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentSession) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId: currentSession.id,
      userId: user.id,
      role: 'user',
      content: inputMessage,
      modelId: selectedModel,
      tokensUsed: 0,
      createdAt: new Date().toISOString()
    }

    // Add message to UI immediately
    setMessages(prev => [...prev, userMessage])
    
    // Save user message to database
    await dbHelpers.saveMessage(userMessage)

    const currentInput = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      const selectedModelData = availableModels.find(m => m.id === selectedModel)
      let fullResponse = ''
      
      // Build message history for context
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
      
      recentMessages.push({
        role: 'user' as const,
        content: currentInput
      })
      
      await blink.ai.streamText(
        {
          messages: recentMessages,
          model: selectedModelData?.modelId || 'gpt-4o-mini',
          maxTokens: selectedModelData?.maxTokens || 4000,
          temperature: selectedModelData?.temperature || 0.7
        },
        (chunk) => {
          fullResponse += chunk
          setStreamingMessage(fullResponse)
        }
      )

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sessionId: currentSession.id,
        userId: user.id,
        role: 'assistant',
        content: fullResponse,
        modelId: selectedModel,
        tokensUsed: Math.ceil(fullResponse.length / 4),
        createdAt: new Date().toISOString()
      }

      // Add to UI and save to database
      setMessages(prev => [...prev, assistantMessage])
      await dbHelpers.saveMessage(assistantMessage)
      
      setStreamingMessage('')

      // Update session timestamp
      if (currentSession) {
        await blink.db.chatSessions.update(currentSession.id, {
          updatedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sessionId: currentSession.id,
        userId: user.id,
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。',
        modelId: selectedModel,
        tokensUsed: 0,
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      await dbHelpers.saveMessage(errorMessage)
      setStreamingMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getModelIcon = (modelId: string) => {
    if (modelId.includes('gpt')) return <Zap className="w-4 h-4" />
    if (modelId.includes('claude')) return <Sparkles className="w-4 h-4" />
    return <Bot className="w-4 h-4" />
  }

  const currentChannel = availableChannels.find(c => c.id === selectedChannel)
  const allowedModels = availableModels.filter(m => {
    if (!currentChannel?.allowedModels) return true
    try {
      const allowed = JSON.parse(currentChannel.allowedModels)
      return allowed.includes(m.id)
    } catch {
      return true
    }
  })

  // Create new session
  const handleNewSession = async () => {
    try {
      const newSession = await dbHelpers.getOrCreateSession(user.id, selectedChannel, selectedModel)
      if (newSession) {
        setCurrentSession(newSession)
        setMessages([])
        
        // Refresh sessions list
        const userSessions = await dbHelpers.getUserSessions(user.id)
        setSessions(userSessions)
      }
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }

  // Switch to different session
  const handleSwitchSession = async (session: ChatSession) => {
    try {
      setCurrentSession(session)
      const sessionMessages = await dbHelpers.getSessionMessages(session.id)
      setMessages(sessionMessages.map(msg => ({
        ...msg,
        tokensUsed: msg.tokensUsed || 0
      })))
      setShowSessionDialog(false)
    } catch (error) {
      console.error('Error switching session:', error)
    }
  }

  // Export chat history
  const handleExportChat = () => {
    const chatData = {
      session: currentSession?.title,
      channel: currentChannel?.name,
      model: availableModels.find(m => m.id === selectedModel)?.displayName,
      exportTime: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        model: availableModels.find(m => m.id === msg.modelId)?.displayName
      }))
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Clear current session
  const handleClearChat = async () => {
    if (window.confirm('确定要清空当前会话的所有消息吗？此操作不可撤销。')) {
      try {
        // Delete messages from database
        if (currentSession) {
          await blink.db.sql(`DELETE FROM chat_messages WHERE session_id = '${currentSession.id}'`)
        }
        setMessages([])
        setStreamingMessage('')
      } catch (error) {
        console.error('Error clearing chat:', error)
      }
    }
  }

  // Copy message content
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI 会话平台</h1>
              <p className="text-sm text-gray-500">智能对话助手</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-white text-sm">
                {user.displayName?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500">{user.role === 'admin' ? '管理员' : '用户'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => blink.auth.logout()}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Session Management */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">当前会话</label>
            <div className="flex gap-1">
              <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="会话历史">
                    <History className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>会话历史</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          currentSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleSwitchSession(session)}
                      >
                        <div className="font-medium text-sm">{session.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        暂无会话历史
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" onClick={handleNewSession} title="新建会话">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600 truncate">
            {currentSession?.title || '新对话'}
          </div>
        </div>

        {/* Channel Selection */}
        <div className="p-4 border-b border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-2 block">选择渠道</label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableChannels.map(channel => (
                <SelectItem key={channel.id} value={channel.id}>
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-xs text-gray-500">{channel.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        <div className="p-4 border-b border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-2 block">选择模型</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    {getModelIcon(model.id)}
                    <span>{model.displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Admin Link */}
        {user.role === 'admin' && (
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin'}
            >
              <Settings className="w-4 h-4 mr-2" />
              管理后台
            </Button>
          </div>
        )}

        <div className="flex-1" />

        {/* Session Stats */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">会话统计</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">消息数:</span>
              <span className="font-medium">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token使用:</span>
              <span className="font-medium">
                {messages.reduce((total, msg) => total + msg.tokensUsed, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Current Model Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">当前模型</div>
          <div className="flex items-center gap-2">
            {getModelIcon(selectedModel)}
            <span className="text-sm font-medium">
              {availableModels.find(m => m.id === selectedModel)?.displayName}
            </span>
            <Badge variant="secondary" className="text-xs">
              {availableModels.find(m => m.id === selectedModel)?.provider}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                {getModelIcon(selectedModel)}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {currentChannel?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  使用 {availableModels.find(m => m.id === selectedModel)?.displayName}
                </p>
              </div>
            </div>
            
            {/* Chat Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportChat}
                disabled={messages.length === 0}
                title="导出聊天记录"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={messages.length === 0}
                title="清空聊天记录"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">开始对话</h3>
                <p className="text-gray-500">向AI助手提问任何问题，开始智能对话</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-primary text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`max-w-2xl ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white'} group relative`}>
                  <CardContent className="p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                        {message.role === 'assistant' && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <span>{availableModels.find(m => m.id === message.modelId)?.displayName}</span>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
                          message.role === 'user' ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="复制消息"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Streaming Message */}
            {streamingMessage && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-primary text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                
                <Card className="max-w-2xl bg-white">
                  <CardContent className="p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {streamingMessage}
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  disabled={isLoading}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行
            </div>
          </div>
        </div>
      </div>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            <span>已复制到剪贴板</span>
          </div>
        </div>
      )}
    </div>
  )
}