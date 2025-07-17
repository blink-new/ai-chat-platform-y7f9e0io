import { useState } from 'react'
import { User, UserPermission, Channel, AIModel } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Shield, 
  Plus, 
  Trash2, 
  Users,
  Bot,
  MessageSquare,
  Check,
  X
} from 'lucide-react'

export function PermissionsManagement() {
  const [permissions, setPermissions] = useState<UserPermission[]>([
    {
      id: '1',
      userId: '2',
      channelId: 'coding',
      modelId: undefined,
      permissionType: 'allow',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: '3',
      channelId: undefined,
      modelId: 'gpt-4o',
      permissionType: 'deny',
      createdAt: new Date().toISOString()
    }
  ])

  const [users] = useState<User[]>([
    {
      id: '1',
      email: 'admin@example.com',
      displayName: '系统管理员',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user1@example.com',
      displayName: '张三',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'user2@example.com',
      displayName: '李四',
      role: 'user',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])

  const [channels] = useState<Channel[]>([
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
    }
  ])

  const [models] = useState<AIModel[]>([
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
    }
  ])

  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getUserPermissions = (userId: string) => {
    return permissions.filter(p => p.userId === userId)
  }

  const handleAddPermission = (permissionData: Partial<UserPermission>) => {
    const newPermission: UserPermission = {
      id: Date.now().toString(),
      userId: permissionData.userId || '',
      channelId: permissionData.channelId,
      modelId: permissionData.modelId,
      permissionType: permissionData.permissionType || 'allow',
      createdAt: new Date().toISOString()
    }
    setPermissions(prev => [...prev, newPermission])
    setIsDialogOpen(false)
  }

  const handleDeletePermission = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId))
  }

  const getPermissionIcon = (type: 'allow' | 'deny') => {
    return type === 'allow' ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    )
  }

  const getPermissionColor = (type: 'allow' | 'deny') => {
    return type === 'allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getPermissionLabel = (type: 'allow' | 'deny') => {
    return type === 'allow' ? '允许' : '拒绝'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">权限管理</h2>
          <p className="text-gray-600">管理用户对渠道和模型的访问权限</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加权限
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总权限数</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">允许权限</p>
                <p className="text-2xl font-bold">{permissions.filter(p => p.permissionType === 'allow').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">拒绝权限</p>
                <p className="text-2xl font-bold">{permissions.filter(p => p.permissionType === 'deny').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-user">按用户查看</TabsTrigger>
          <TabsTrigger value="by-resource">按资源查看</TabsTrigger>
        </TabsList>

        <TabsContent value="by-user" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => {
              const userPermissions = getUserPermissions(user.id)
              return (
                <Card key={user.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-white">
                          {user.displayName?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.displayName || user.email}</CardTitle>
                        <p className="text-sm text-gray-600">{user.role === 'admin' ? '管理员' : '用户'}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userPermissions.length === 0 ? (
                      <p className="text-sm text-gray-500">无特殊权限设置</p>
                    ) : (
                      <div className="space-y-2">
                        {userPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getPermissionIcon(permission.permissionType)}
                              <span className="text-sm">
                                {permission.channelId 
                                  ? channels.find(c => c.id === permission.channelId)?.name
                                  : models.find(m => m.id === permission.modelId)?.displayName
                                }
                              </span>
                              <Badge className={getPermissionColor(permission.permissionType)}>
                                {getPermissionLabel(permission.permissionType)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePermission(permission.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-resource" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  渠道权限
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {channels.map((channel) => {
                  const channelPermissions = permissions.filter(p => p.channelId === channel.id)
                  return (
                    <div key={channel.id} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{channel.name}</h4>
                      {channelPermissions.length === 0 ? (
                        <p className="text-sm text-gray-500">无特殊权限设置</p>
                      ) : (
                        <div className="space-y-1">
                          {channelPermissions.map((permission) => {
                            const user = users.find(u => u.id === permission.userId)
                            return (
                              <div key={permission.id} className="flex items-center justify-between text-sm">
                                <span>{user?.displayName || user?.email}</span>
                                <Badge className={getPermissionColor(permission.permissionType)}>
                                  {getPermissionLabel(permission.permissionType)}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  模型权限
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {models.map((model) => {
                  const modelPermissions = permissions.filter(p => p.modelId === model.id)
                  return (
                    <div key={model.id} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{model.displayName}</h4>
                      {modelPermissions.length === 0 ? (
                        <p className="text-sm text-gray-500">无特殊权限设置</p>
                      ) : (
                        <div className="space-y-1">
                          {modelPermissions.map((permission) => {
                            const user = users.find(u => u.id === permission.userId)
                            return (
                              <div key={permission.id} className="flex items-center justify-between text-sm">
                                <span>{user?.displayName || user?.email}</span>
                                <Badge className={getPermissionColor(permission.permissionType)}>
                                  {getPermissionLabel(permission.permissionType)}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Permission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加权限</DialogTitle>
          </DialogHeader>
          <PermissionForm
            users={users}
            channels={channels}
            models={models}
            onSave={handleAddPermission}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PermissionFormProps {
  users: User[]
  channels: Channel[]
  models: AIModel[]
  onSave: (permission: Partial<UserPermission>) => void
  onCancel: () => void
}

function PermissionForm({ users, channels, models, onSave, onCancel }: PermissionFormProps) {
  const [formData, setFormData] = useState({
    userId: '',
    resourceType: 'channel' as 'channel' | 'model',
    channelId: '',
    modelId: '',
    permissionType: 'allow' as 'allow' | 'deny'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      userId: formData.userId,
      channelId: formData.resourceType === 'channel' ? formData.channelId : undefined,
      modelId: formData.resourceType === 'model' ? formData.modelId : undefined,
      permissionType: formData.permissionType
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">用户</label>
        <Select
          value={formData.userId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择用户" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.displayName || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">资源类型</label>
        <Select
          value={formData.resourceType}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            resourceType: value as 'channel' | 'model',
            channelId: '',
            modelId: ''
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="channel">渠道</SelectItem>
            <SelectItem value="model">模型</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.resourceType === 'channel' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">渠道</label>
          <Select
            value={formData.channelId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, channelId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择渠道" />
            </SelectTrigger>
            <SelectContent>
              {channels.map(channel => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.resourceType === 'model' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">模型</label>
          <Select
            value={formData.modelId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, modelId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">权限类型</label>
        <Select
          value={formData.permissionType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, permissionType: value as 'allow' | 'deny' }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="allow">允许</SelectItem>
            <SelectItem value="deny">拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          添加
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  )
}