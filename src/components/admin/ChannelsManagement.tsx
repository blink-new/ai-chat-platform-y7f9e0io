import { useState } from 'react'
import { Channel, AIModel } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Checkbox } from '../ui/checkbox'
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Activity,
  Users
} from 'lucide-react'

export function ChannelsManagement() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'general',
      name: '通用聊天',
      description: '支持所有AI模型的通用聊天渠道',
      allowedModels: ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'coding',
      name: '编程助手',
      description: '专门用于编程相关问题的渠道',
      allowedModels: ['gpt-4o', 'claude-3-5-sonnet'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'creative',
      name: '创意写作',
      description: '用于创意写作和内容创作的渠道',
      allowedModels: ['gpt-4o', 'claude-3-5-sonnet'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])

  const availableModels: AIModel[] = [
    {
      id: 'gpt-4o-mini',
      name: 'gpt-4o-mini',
      displayName: 'GPT-4o Mini',
      provider: 'openai',
      modelId: 'gpt-4o-mini',
      isActive: true,
      maxTokens: 4000,
      temperature: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gpt-4o',
      name: 'gpt-4o',
      displayName: 'GPT-4o',
      provider: 'openai',
      modelId: 'gpt-4o',
      isActive: true,
      maxTokens: 4000,
      temperature: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'claude-3-5-sonnet',
      displayName: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      modelId: 'claude-3-5-sonnet-20241022',
      isActive: true,
      maxTokens: 4000,
      temperature: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, isActive: !channel.isActive, updatedAt: new Date().toISOString() }
        : channel
    ))
  }

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel)
    setIsDialogOpen(true)
  }

  const handleSaveChannel = (channelData: Partial<Channel>) => {
    if (editingChannel) {
      setChannels(prev => prev.map(channel => 
        channel.id === editingChannel.id 
          ? { ...channel, ...channelData, updatedAt: new Date().toISOString() }
          : channel
      ))
    } else {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: channelData.name || '',
        description: channelData.description || '',
        allowedModels: channelData.allowedModels || [],
        isActive: channelData.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setChannels(prev => [...prev, newChannel])
    }
    setEditingChannel(null)
    setIsDialogOpen(false)
  }

  const handleDeleteChannel = (channelId: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId))
  }

  const handleAddChannel = () => {
    setEditingChannel(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">渠道管理</h2>
          <p className="text-gray-600">配置和管理聊天渠道</p>
        </div>
        <Button onClick={handleAddChannel}>
          <Plus className="w-4 h-4 mr-2" />
          添加渠道
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总渠道数</p>
                <p className="text-2xl font-bold">{channels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">活跃渠道</p>
                <p className="text-2xl font-bold">{channels.filter(c => c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均模型数</p>
                <p className="text-2xl font-bold">
                  {Math.round(channels.reduce((acc, c) => acc + c.allowedModels.length, 0) / channels.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id} className={`${!channel.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{channel.name}</CardTitle>
                <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                  {channel.isActive ? '启用' : '禁用'}
                </Badge>
              </div>
              {channel.description && (
                <p className="text-sm text-gray-600">{channel.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">支持的模型:</p>
                <div className="flex flex-wrap gap-1">
                  {channel.allowedModels.map((modelId) => {
                    const model = availableModels.find(m => m.id === modelId)
                    return (
                      <Badge key={modelId} variant="outline" className="text-xs">
                        {model?.displayName || modelId}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={channel.isActive}
                    onCheckedChange={() => handleToggleChannel(channel.id)}
                  />
                  <span className="text-sm text-gray-600">
                    {channel.isActive ? '启用' : '禁用'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditChannel(channel)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChannel(channel.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Add Channel Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? '编辑渠道' : '添加渠道'}
            </DialogTitle>
          </DialogHeader>
          <ChannelForm
            channel={editingChannel}
            availableModels={availableModels}
            onSave={handleSaveChannel}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ChannelFormProps {
  channel: Channel | null
  availableModels: AIModel[]
  onSave: (channel: Partial<Channel>) => void
  onCancel: () => void
}

function ChannelForm({ channel, availableModels, onSave, onCancel }: ChannelFormProps) {
  const [formData, setFormData] = useState({
    name: channel?.name || '',
    description: channel?.description || '',
    allowedModels: channel?.allowedModels || [],
    isActive: channel?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleModelToggle = (modelId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowedModels: checked
        ? [...prev.allowedModels, modelId]
        : prev.allowedModels.filter(id => id !== modelId)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">渠道名称</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="通用聊天"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="渠道描述..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>支持的模型</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
          {availableModels.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <Checkbox
                id={model.id}
                checked={formData.allowedModels.includes(model.id)}
                onCheckedChange={(checked) => handleModelToggle(model.id, checked as boolean)}
              />
              <Label htmlFor={model.id} className="text-sm font-normal">
                {model.displayName}
                <span className="text-gray-500 ml-1">({model.provider})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">启用渠道</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {channel ? '更新' : '添加'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  )
}