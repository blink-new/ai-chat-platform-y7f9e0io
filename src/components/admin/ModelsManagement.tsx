import { useState } from 'react'
import { AIModel } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Zap, 
  Sparkles,
  Settings,
  Activity
} from 'lucide-react'

export function ModelsManagement() {
  const [models, setModels] = useState<AIModel[]>([
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
  ])

  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getModelIcon = (provider: string) => {
    if (provider === 'openai') return <Zap className="w-4 h-4" />
    if (provider === 'anthropic') return <Sparkles className="w-4 h-4" />
    return <Bot className="w-4 h-4" />
  }

  const getProviderColor = (provider: string) => {
    if (provider === 'openai') return 'bg-green-100 text-green-800'
    if (provider === 'anthropic') return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const handleToggleModel = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, isActive: !model.isActive, updatedAt: new Date().toISOString() }
        : model
    ))
  }

  const handleEditModel = (model: AIModel) => {
    setEditingModel(model)
    setIsDialogOpen(true)
  }

  const handleSaveModel = (modelData: Partial<AIModel>) => {
    if (editingModel) {
      setModels(prev => prev.map(model => 
        model.id === editingModel.id 
          ? { ...model, ...modelData, updatedAt: new Date().toISOString() }
          : model
      ))
    } else {
      const newModel: AIModel = {
        id: Date.now().toString(),
        name: modelData.name || '',
        displayName: modelData.displayName || '',
        provider: modelData.provider || 'openai',
        modelId: modelData.modelId || '',
        isActive: modelData.isActive ?? true,
        maxTokens: modelData.maxTokens || 4000,
        temperature: modelData.temperature || 0.7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setModels(prev => [...prev, newModel])
    }
    setEditingModel(null)
    setIsDialogOpen(false)
  }

  const handleDeleteModel = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId))
  }

  const handleAddModel = () => {
    setEditingModel(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 模型管理</h2>
          <p className="text-gray-600">配置和管理可用的AI模型</p>
        </div>
        <Button onClick={handleAddModel}>
          <Plus className="w-4 h-4 mr-2" />
          添加模型
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总模型数</p>
                <p className="text-2xl font-bold">{models.length}</p>
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
                <p className="text-sm text-gray-600">活跃模型</p>
                <p className="text-2xl font-bold">{models.filter(m => m.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">提供商</p>
                <p className="text-2xl font-bold">{new Set(models.map(m => m.provider)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.id} className={`${!model.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getModelIcon(model.provider)}
                  <CardTitle className="text-lg">{model.displayName}</CardTitle>
                </div>
                <Badge className={getProviderColor(model.provider)}>
                  {model.provider}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">模型ID:</span>
                  <span className="font-mono text-xs">{model.modelId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">最大Token:</span>
                  <span>{model.maxTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">温度:</span>
                  <span>{model.temperature}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={model.isActive}
                    onCheckedChange={() => handleToggleModel(model.id)}
                  />
                  <span className="text-sm text-gray-600">
                    {model.isActive ? '启用' : '禁用'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id)}
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

      {/* Edit/Add Model Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? '编辑模型' : '添加模型'}
            </DialogTitle>
          </DialogHeader>
          <ModelForm
            model={editingModel}
            onSave={handleSaveModel}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ModelFormProps {
  model: AIModel | null
  onSave: (model: Partial<AIModel>) => void
  onCancel: () => void
}

function ModelForm({ model, onSave, onCancel }: ModelFormProps) {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    displayName: model?.displayName || '',
    provider: model?.provider || 'openai',
    modelId: model?.modelId || '',
    maxTokens: model?.maxTokens || 4000,
    temperature: model?.temperature || 0.7,
    isActive: model?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">模型名称</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="gpt-4o"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">显示名称</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          placeholder="GPT-4o"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="provider">提供商</Label>
        <Select
          value={formData.provider}
          onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="modelId">模型ID</Label>
        <Input
          id="modelId"
          value={formData.modelId}
          onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
          placeholder="gpt-4o"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxTokens">最大Token</Label>
          <Input
            id="maxTokens"
            type="number"
            value={formData.maxTokens}
            onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            min="1"
            max="100000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">温度</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            min="0"
            max="2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">启用模型</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {model ? '更新' : '添加'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  )
}