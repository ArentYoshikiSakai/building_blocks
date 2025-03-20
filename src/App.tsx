import { useEffect } from 'react'
import { EditorScene } from './scenes/EditorScene'
import { useBlockStore } from './store/useBlockStore'
import './App.css'

function App() {
  const { createNewProject, activeProject } = useBlockStore()

  // アプリケーション開始時に新しいプロジェクトを作成
  useEffect(() => {
    if (!activeProject) {
      createNewProject('新しいプロジェクト')
    }
  }, [activeProject, createNewProject])

  return (
    <div className="app-container">
      <EditorScene />
    </div>
  )
}

export default App
