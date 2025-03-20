import { Vector3, Euler } from 'three';

export type BlockType = 'cube' | 'rectangle' | 'cylinder' | 'triangle' | 'arch' | 'wheel' | 'window' | 'door';

export interface Block {
  id: string;
  type: BlockType;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  color: string;
  properties?: Record<string, any>; // 特殊パーツ用の追加プロパティ
}

export interface ProjectSettings {
  backgroundColor: string;
  groundTexture: string;
  lightingMode: 'day' | 'night' | 'custom';
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  isPublic: boolean;
  blocks: Block[];
  settings: ProjectSettings;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  projects: string[]; // プロジェクトIDの配列
} 