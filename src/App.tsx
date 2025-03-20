import { useEffect, useState } from 'react'
import { EditorScene } from './scenes/EditorScene'
import { useBlockStore } from './store/useBlockStore'
import { useProjectStore } from './stores/useProjectStore'
import { AuthProvider } from './firebase/authContext'
import { AuthModal } from './components/ui/AuthModal'
import { ProjectModal } from './components/ui/ProjectModal'
import { Project } from './models/Project'
import './App.css'

function App() {
  const { createNewProject, activeProject } = useBlockStore()
  const { setCurrentProject } = useProjectStore()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  // アプリケーション開始時に新しいプロジェクトを作成
  useEffect(() => {
    if (!activeProject) {
      createNewProject('新しいプロジェクト')
    }
  }, [activeProject, createNewProject])

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false)
  }
  
  const handleOpenProjectModal = () => {
    setIsProjectModalOpen(true)
  }
  
  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false)
  }
  
  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
  }

  return (
    <AuthProvider>
      <div className="app-container">
        <EditorScene 
          onAuthClick={handleOpenAuthModal} 
          onProjectClick={handleOpenProjectModal}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={handleCloseAuthModal} 
        />
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onProjectSelect={handleProjectSelect}
        />
      </div>
    </AuthProvider>
  )
}

export default App
