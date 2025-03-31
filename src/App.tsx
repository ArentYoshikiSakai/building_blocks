import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useBlockStore } from './store/useBlockStore'
import { useProjectStore } from './stores/useProjectStore'
import { AuthProvider } from './contexts/AuthContext'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/admin/LoginPage'
import './App.css'

function App() {
  const { createNewProject, activeProject } = useBlockStore()
  const { setCurrentProject } = useProjectStore()
  
  // アプリケーション開始時に新しいプロジェクトを作成
  useEffect(() => {
    if (!activeProject) {
      createNewProject('新しいプロジェクト')
    }
  }, [activeProject, createNewProject])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
