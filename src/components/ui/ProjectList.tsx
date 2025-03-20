import React, { useEffect, useState } from 'react';
import { useAuth } from '../../firebase/authContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { Project } from '../../models/Project';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  onProjectSelect: (project: Project) => void;
  onClose: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect, onClose }) => {
  const { user } = useAuth();
  const { 
    projects, 
    loadUserProjects, 
    loadingProjects, 
    errorMessage, 
    deleteProject,
    createProject
  } = useProjectStore();
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  // ユーザーがログインしたらプロジェクト一覧を取得
  useEffect(() => {
    if (user) {
      loadUserProjects(user.uid);
    }
  }, [user, loadUserProjects]);
  
  // プロジェクト作成フォームの表示/非表示
  const toggleCreateForm = () => {
    setIsCreatingProject(!isCreatingProject);
    setNewProjectName('');
    setNewProjectDesc('');
  };
  
  // 新規プロジェクト作成
  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const project = createProject(newProjectName, newProjectDesc);
    
    // ユーザーIDを設定
    if (user) {
      project.userId = user.uid;
    }
    
    // 作成したプロジェクトを選択
    onProjectSelect(project);
    onClose();
  };
  
  // プロジェクト削除処理
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('このプロジェクトを削除しますか？')) {
      await deleteProject(projectId);
    }
  };
  
  // 日付フォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={styles.projectList}>
      <div className={styles.header}>
        <h2>マイプロジェクト</h2>
        <button 
          className={styles.closeButton} 
          onClick={onClose} 
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      
      <div className={styles.createProjectSection}>
        {isCreatingProject ? (
          <div className={styles.createForm}>
            <input
              type="text"
              placeholder="プロジェクト名"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className={styles.input}
            />
            <textarea
              placeholder="説明（任意）"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className={styles.textarea}
            />
            <div className={styles.formActions}>
              <button 
                className={styles.cancelButton} 
                onClick={toggleCreateForm}
              >
                キャンセル
              </button>
              <button 
                className={styles.createButton} 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                作成
              </button>
            </div>
          </div>
        ) : (
          <button 
            className={styles.newProjectButton} 
            onClick={toggleCreateForm}
          >
            + 新規プロジェクト
          </button>
        )}
      </div>
      
      {loadingProjects ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.length === 0 ? (
            <div className={styles.noProjects}>
              プロジェクトがありません。新しいプロジェクトを作成してください。
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                className={styles.projectCard}
                onClick={() => onProjectSelect(project)}
              >
                <div className={styles.projectInfo}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  {project.description && (
                    <p className={styles.projectDescription}>{project.description}</p>
                  )}
                  <div className={styles.projectMeta}>
                    <span>更新日: {formatDate(project.updatedAt)}</span>
                    <span>ブロック数: {project.blocks.length}</span>
                  </div>
                </div>
                <div className={styles.projectActions}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    aria-label="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 