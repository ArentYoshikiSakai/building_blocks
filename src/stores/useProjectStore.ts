import { create } from 'zustand';
import { Project } from '../models/Project';
import { Block } from '../models/Block';
import { v4 as uuidv4 } from 'uuid';
import {
  createProject as createFirestoreProject,
  updateProject as updateFirestoreProject,
  deleteProject as deleteFirestoreProject,
  getProject as getFirestoreProject,
  getUserProjects as getFirestoreUserProjects
} from '../firebase/firestore';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loadingProjects: boolean;
  errorMessage: string | null;
  
  // プロジェクト管理
  createProject: (name: string, description?: string) => Project;
  setCurrentProject: (project: Project | null) => void;
  saveProject: (includeBlocks?: boolean) => Promise<boolean>;
  loadProject: (projectId: string) => Promise<boolean>;
  loadUserProjects: (userId: string) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  updateProjectDetails: (details: Partial<Project>) => void;
  
  // ブロック操作
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  removeAllBlocks: () => void;
  
  // 状態管理
  setLoadingProjects: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
}

const DEFAULT_PROJECT: Project = {
  id: uuidv4(),
  name: 'マイプロジェクト',
  blocks: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isPublic: false
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: DEFAULT_PROJECT,
  loadingProjects: false,
  errorMessage: null,
  
  // プロジェクト管理
  createProject: (name, description) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      blocks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description,
      isPublic: false
    };
    
    set(state => ({
      currentProject: newProject,
      projects: [...state.projects, newProject]
    }));
    
    return newProject;
  },
  
  setCurrentProject: (project) => {
    set({ currentProject: project });
  },
  
  saveProject: async (includeBlocks = true) => {
    const { currentProject } = get();
    
    if (!currentProject) return false;
    
    try {
      set({ loadingProjects: true, errorMessage: null });
      
      const projectToSave = { 
        ...currentProject,
        updatedAt: Date.now(),
        // もしincludeBlocksがfalseの場合、ブロック情報を含めない（メタデータのみ更新）
        blocks: includeBlocks ? currentProject.blocks : undefined
      };
      
      // 新規プロジェクトかどうかを判断
      const isNewProject = !get().projects.some(p => p.id === currentProject.id);
      
      if (isNewProject) {
        await createFirestoreProject(projectToSave);
        set(state => ({
          projects: [...state.projects, currentProject]
        }));
      } else {
        await updateFirestoreProject(projectToSave);
        set(state => ({
          projects: state.projects.map(p => 
            p.id === currentProject.id ? { ...p, ...projectToSave } : p
          )
        }));
      }
      
      set({ loadingProjects: false });
      return true;
    } catch (error) {
      console.error('Failed to save project:', error);
      set({ 
        loadingProjects: false, 
        errorMessage: error instanceof Error ? error.message : '保存に失敗しました'
      });
      return false;
    }
  },
  
  loadProject: async (projectId) => {
    try {
      set({ loadingProjects: true, errorMessage: null });
      
      const project = await getFirestoreProject(projectId);
      
      if (project) {
        set({ currentProject: project, loadingProjects: false });
        return true;
      }
      
      set({ 
        loadingProjects: false, 
        errorMessage: 'プロジェクトが見つかりませんでした'
      });
      return false;
    } catch (error) {
      console.error('Failed to load project:', error);
      set({ 
        loadingProjects: false, 
        errorMessage: error instanceof Error ? error.message : '読み込みに失敗しました'
      });
      return false;
    }
  },
  
  loadUserProjects: async (userId) => {
    try {
      set({ loadingProjects: true, errorMessage: null });
      
      const userProjects = await getFirestoreUserProjects(userId);
      
      set({ 
        projects: userProjects, 
        loadingProjects: false 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load user projects:', error);
      set({ 
        loadingProjects: false, 
        errorMessage: error instanceof Error ? error.message : 'プロジェクト一覧の読み込みに失敗しました'
      });
      return false;
    }
  },
  
  deleteProject: async (projectId) => {
    try {
      set({ loadingProjects: true, errorMessage: null });
      
      await deleteFirestoreProject(projectId);
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        loadingProjects: false
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      set({ 
        loadingProjects: false, 
        errorMessage: error instanceof Error ? error.message : '削除に失敗しました'
      });
      return false;
    }
  },
  
  updateProjectDetails: (details) => {
    const { currentProject } = get();
    
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      ...details,
      updatedAt: Date.now()
    };
    
    set({ currentProject: updatedProject });
  },
  
  // ブロック操作
  addBlock: (block) => {
    set(state => {
      if (!state.currentProject) return state;
      
      const updatedProject = {
        ...state.currentProject,
        blocks: [...state.currentProject.blocks, block],
        updatedAt: Date.now()
      };
      
      return { currentProject: updatedProject };
    });
  },
  
  updateBlock: (id, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      
      const updatedBlocks = state.currentProject.blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      );
      
      const updatedProject = {
        ...state.currentProject,
        blocks: updatedBlocks,
        updatedAt: Date.now()
      };
      
      return { currentProject: updatedProject };
    });
  },
  
  removeBlock: (id) => {
    set(state => {
      if (!state.currentProject) return state;
      
      const updatedBlocks = state.currentProject.blocks.filter(block => block.id !== id);
      
      const updatedProject = {
        ...state.currentProject,
        blocks: updatedBlocks,
        updatedAt: Date.now()
      };
      
      return { currentProject: updatedProject };
    });
  },
  
  removeAllBlocks: () => {
    set(state => {
      if (!state.currentProject) return state;
      
      const updatedProject = {
        ...state.currentProject,
        blocks: [],
        updatedAt: Date.now()
      };
      
      return { currentProject: updatedProject };
    });
  },
  
  // 状態管理
  setLoadingProjects: (loading) => {
    set({ loadingProjects: loading });
  },
  
  setErrorMessage: (message) => {
    set({ errorMessage: message });
  }
})); 