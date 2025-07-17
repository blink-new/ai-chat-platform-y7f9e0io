import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { User } from '../types'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ModelsManagement } from './admin/ModelsManagement'
import { ChannelsManagement } from './admin/ChannelsManagement'
import { UsersManagement } from './admin/UsersManagement'
import { PermissionsManagement } from './admin/PermissionsManagement'
import { 
  Settings, 
  Users, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  ArrowLeft,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react'

interface AdminDashboardProps {
  user: User
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalMessages: number
  totalSessions: number
  totalModels: number
  activeChannels: number
  todayMessages: number
  avgMessagesPerSession: number
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const location = useLocation()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalSessions: 0,
    totalModels: 0,
    activeChannels: 0,
    todayMessages: 0,
    avgMessagesPerSession: 0
  })
  const [loading, setLoading] = useState(true)

  const navigationItems = [
    { id: 'overview', label: '概览', icon: BarChart3, path: '/admin' },
    { id: 'users', label: '用户管理', icon: Users, path: '/admin/users' },
    { id: 'models', label: '模型配置', icon: Bot, path: '/admin/models' },
    { id: 'channels', label: '渠道管理', icon: MessageSquare, path: '/admin/channels' },
    { id: 'permissions', label: '权限管理', icon: Shield, path: '/admin/permissions' }
  ]

  // Load system statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        
        // Get counts from database
        const [
          usersResult,
          activeUsersResult,
          messagesResult,
          sessionsResult,
          modelsResult,
          channelsResult,
          todayMessagesResult
        ] = await Promise.all([
          blink.db.sql('SELECT COUNT(*) as count FROM users'),
          blink.db.sql('SELECT COUNT(*) as count FROM users WHERE is_active = 1'),
          blink.db.sql('SELECT COUNT(*) as count FROM chat_messages'),
          blink.db.sql('SELECT COUNT(*) as count FROM chat_sessions'),
          blink.db.sql('SELECT COUNT(*) as count FROM ai_models WHERE is_active = 1'),
          blink.db.sql('SELECT COUNT(*) as count FROM channels WHERE is_active = 1'),
          blink.db.sql(`SELECT COUNT(*) as count FROM chat_messages WHERE DATE(created_at) = DATE('now')`)
        ])

        // Calculate average messages per session
        const avgResult = await blink.db.sql(`
          SELECT 
            CASE 
              WHEN COUNT(DISTINCT session_id) > 0 
              THEN CAST(COUNT(*) AS REAL) / COUNT(DISTINCT session_id)
              ELSE 0 
            END as avg_messages
          FROM chat_messages
        `)

        setStats({
          totalUsers: usersResult[0]?.count || 0,
          activeUsers: activeUsersResult[0]?.count || 0,
          totalMessages: messagesResult[0]?.count || 0,
          totalSessions: sessionsResult[0]?.count || 0,
          totalModels: modelsResult[0]?.count || 0,
          activeChannels: channelsResult[0]?.count || 0,
          todayMessages: todayMessagesResult[0]?.count || 0,
          avgMessagesPerSession: Math.round(avgResult[0]?.avg_messages || 0)
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
              <p className="text-sm text-gray-500">系统管理</p>
            </div>
          </div>

          <Link to="/">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回聊天
            </Button>
          </Link>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link key={item.id} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="text-xs text-gray-500 mb-2">系统状态</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">数据库</span>
              <Badge className="bg-green-100 text-green-800 text-xs">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">AI服务</span>
              <Badge className="bg-green-100 text-green-800 text-xs">正常</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<OverviewPage stats={stats} loading={loading} />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
        </Routes>
      </div>
    </div>
  )
}

function OverviewPage({ stats, loading }: { stats: SystemStats; loading: boolean }) {
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        // Get recent messages with user info
        const recentMessages = await blink.db.sql(`
          SELECT 
            cm.content,
            cm.role,
            cm.created_at,
            u.display_name,
            u.email,
            am.display_name as model_name
          FROM chat_messages cm
          LEFT JOIN users u ON cm.user_id = u.id
          LEFT JOIN ai_models am ON cm.model_id = am.id
          ORDER BY cm.created_at DESC
          LIMIT 10
        `)
        
        setRecentActivity(recentMessages || [])
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }
    }

    loadRecentActivity()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">系统概览</h1>
        <p className="text-gray-600">AI会话平台管理仪表板</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃用户</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总消息数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">可用模型</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalModels}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日消息</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayMessages}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总会话数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃渠道</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeChannels}</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均消息/会话</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMessagesPerSession}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.role === 'user' ? (
                      <Users className="w-4 h-4 text-primary" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {activity.display_name || activity.email}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.model_name}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无最近活动
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/admin/users">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  管理用户
                </Button>
              </Link>
              <Link to="/admin/models">
                <Button className="w-full justify-start" variant="outline">
                  <Bot className="w-4 h-4 mr-2" />
                  配置AI模型
                </Button>
              </Link>
              <Link to="/admin/channels">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  管理渠道
                </Button>
              </Link>
              <Link to="/admin/permissions">
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  权限设置
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersPage() {
  return (
    <div className="p-8">
      <UsersManagement />
    </div>
  )
}

function ModelsPage() {
  return (
    <div className="p-8">
      <ModelsManagement />
    </div>
  )
}

function ChannelsPage() {
  return (
    <div className="p-8">
      <ChannelsManagement />
    </div>
  )
}

function PermissionsPage() {
  return (
    <div className="p-8">
      <PermissionsManagement />
    </div>
  )
}