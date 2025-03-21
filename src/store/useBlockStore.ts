import { create } from 'zustand';
import { Vector3, Euler } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { Block, BlockType, Project, ProjectSettings } from '../types';
import { ToolType } from '../components/ui/ToolBar';

interface BlockState {
  activeProject: Project | null;
  selectedBlockId: string | null;
  isDraggingBlock: boolean; // ドラッグ状態を追跡
  isRotatingBlock: boolean; // 回転状態を追跡
  activeTool: ToolType; // アクティブなツール
  
  // プロジェクト操作
  createNewProject: (name: string) => void;
  setActiveProject: (project: Project) => void;
  
  // ブロック操作
  addBlock: (type: BlockType, position: Vector3, color: string) => void;
  removeBlock: (id: string) => void;
  updateBlockPosition: (id: string, position: Vector3) => void;
  updateBlockRotation: (id: string, rotation: Euler) => void;
  updateBlockColor: (id: string, color: string) => void;
  updateBlockScale: (id: string, scale: Vector3) => void;
  selectBlock: (id: string | null) => void;
  
  // ドラッグ状態操作
  setDraggingBlock: (isDragging: boolean) => void;
  setRotatingBlock: (isRotating: boolean) => void;
  
  // ツール操作
  setActiveTool: (tool: ToolType) => void;
  
  // 設定操作
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

// デフォルトのプロジェクト設定
const defaultProjectSettings: ProjectSettings = {
  backgroundColor: '#87CEEB', // 空色
  groundTexture: 'grass',
  lightingMode: 'day',
  gridEnabled: true,
  gridSize: 1,
  snapToGrid: true,
};

export const useBlockStore = create<BlockState>((set) => ({
  activeProject: null,
  selectedBlockId: null,
  isDraggingBlock: false, // 初期値はfalse
  isRotatingBlock: false, // 初期値はfalse
  activeTool: 'select', // 初期値は選択ツール
  
  createNewProject: (name) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      blocks: [],
      settings: defaultProjectSettings,
    };
    
    set({ activeProject: newProject });
  },
  
  setActiveProject: (project) => {
    set({ activeProject: project, selectedBlockId: null });
  },
  
  addBlock: (type, position, color) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const newBlock: Block = {
        id: uuidv4(),
        type,
        position,
        rotation: new Euler(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        color,
      };
      
      const updatedProject = {
        ...state.activeProject,
        blocks: [...state.activeProject.blocks, newBlock],
        updatedAt: new Date(),
      };
      
      return {
        activeProject: updatedProject,
        selectedBlockId: newBlock.id,
      };
    });
  },
  
  removeBlock: (id) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const updatedProject = {
        ...state.activeProject,
        blocks: state.activeProject.blocks.filter(block => block.id !== id),
        updatedAt: new Date(),
      };
      
      return {
        activeProject: updatedProject,
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      };
    });
  },
  
  updateBlockPosition: (id, position) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const updatedBlocks = state.activeProject.blocks.map(block => 
        block.id === id ? { ...block, position } : block
      );
      
      return {
        activeProject: {
          ...state.activeProject,
          blocks: updatedBlocks,
          updatedAt: new Date(),
        },
      };
    });
  },
  
  updateBlockRotation: (id, rotation) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const updatedBlocks = state.activeProject.blocks.map(block => 
        block.id === id ? { ...block, rotation } : block
      );
      
      return {
        activeProject: {
          ...state.activeProject,
          blocks: updatedBlocks,
          updatedAt: new Date(),
        },
      };
    });
  },
  
  updateBlockColor: (id, color) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const updatedBlocks = state.activeProject.blocks.map(block => 
        block.id === id ? { ...block, color } : block
      );
      
      return {
        activeProject: {
          ...state.activeProject,
          blocks: updatedBlocks,
          updatedAt: new Date(),
        },
      };
    });
  },
  
  updateBlockScale: (id, scale) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      const updatedBlocks = state.activeProject.blocks.map(block => 
        block.id === id ? { ...block, scale } : block
      );
      
      return {
        activeProject: {
          ...state.activeProject,
          blocks: updatedBlocks,
          updatedAt: new Date(),
        },
      };
    });
  },
  
  selectBlock: (id) => {
    set({ selectedBlockId: id });
  },
  
  // ドラッグ状態を設定するアクション
  setDraggingBlock: (isDragging) => {
    set({ isDraggingBlock: isDragging });
  },
  
  // 回転状態を設定するアクション
  setRotatingBlock: (isRotating) => {
    set({ isRotatingBlock: isRotating });
  },
  
  // アクティブツールを設定するアクション
  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },
  
  updateProjectSettings: (settings) => {
    set((state) => {
      if (!state.activeProject) return state;
      
      return {
        activeProject: {
          ...state.activeProject,
          settings: {
            ...state.activeProject.settings,
            ...settings,
          },
          updatedAt: new Date(),
        },
      };
    });
  },
})); 