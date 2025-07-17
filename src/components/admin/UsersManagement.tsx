import { useState } from 'react'
import { User, UserPermission } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Activity,
  UserCheck,
  Search
} from 'lucide-react'

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@example.com',
      displayName: '系统管理员',
      role: 'admin',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user1@example.com',
      displayName: '张三',
      role: 'user',
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'user2@example.com',
      displayName: '李四',
      role: 'user',
      isActive: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
        : user
    ))
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() }
          : user
      ))
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email || '',
        displayName: userData.displayName || '',
        role: userData.role || 'user',
        isActive: userData.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUsers(prev => [...prev, newUser])
    }
    setEditingUser(null)
    setIsDialogOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return '管理员'
    return '用户'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
          <p className="text-gray-600">管理系统用户和权限</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总用户数</p>
                <p className="text-2xl font-bold">{users.length}</p>
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
                <p className="text-sm text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">管理员</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">普通用户</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg ${!user.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-white">
                      {user.displayName?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.displayName || user.email}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="secondary">已禁用</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      创建于 {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleUser(user.id)}
                    />
                    <span className="text-sm text-gray-600">
                      {user.isActive ? '启用' : '禁用'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">没有找到匹配的用户</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? '编辑用户' : '添加用户'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UserFormProps {
  user: User | null
  onSave: (user: Partial<User>) => void
  onCancel: () => void
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    displayName: user?.displayName || '',
    role: user?.role || 'user',
    isActive: user?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="user@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">显示名称</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          placeholder="用户名"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">角色</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'user' | 'admin' }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">普通用户</SelectItem>
            <SelectItem value="admin">管理员</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">启用用户</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {user ? '更新' : '添加'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  )
}