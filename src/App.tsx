import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './blink/client'
import { User } from './types'
import { ChatInterface } from './components/ChatInterface'
import { AdminDashboard } from './components/AdminDashboard'
import { LoadingScreen } from './components/LoadingScreen'
import { initializeDatabase, dbHelpers } from './lib/database'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize database on app start
    initializeDatabase()

    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      if (state.user) {
        // Get or create user in database
        const userData = await dbHelpers.getOrCreateUser(state.user)
        if (userData) {
          setUser(userData as User)
        }
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 会话平台</h1>
            <p className="text-gray-600 mb-6">请登录以开始使用智能对话服务</p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ChatInterface user={user} />} />
          <Route 
            path="/admin/*" 
            element={
              user.role === 'admin' ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App