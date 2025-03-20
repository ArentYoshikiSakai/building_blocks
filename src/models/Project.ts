import { Project as ExistingProject } from '../types';
import { Vector3, Euler } from 'three';
import { Block } from './Block';

// Firestoreに保存するためのインターフェース
export interface FirestoreProject {
  id: string;
  name: string;
  description?: string;
  createdAt: number; // DateではなくUnixタイムスタンプで保存
  updatedAt: number; // DateではなくUnixタイムスタンプで保存
  userId?: string;
  isPublic: boolean;
  blocks: Block[];
  settings: {
    backgroundColor: string;
    groundTexture: string;
    lightingMode: 'day' | 'night' | 'custom';
    gridEnabled: boolean;
    gridSize: number;
    snapToGrid: boolean;
  };
}

// 既存のProjectインターフェースを再エクスポート
export type Project = ExistingProject;

// Firestoreから取得したプロジェクトをアプリで使用するProject型に変換する関数
export function firestoreToProject(firestoreProject: FirestoreProject): Project {
  return {
    ...firestoreProject,
    createdAt: new Date(firestoreProject.createdAt),
    updatedAt: new Date(firestoreProject.updatedAt),
    ownerId: firestoreProject.userId,
  };
}

// アプリのProject型をFirestore用に変換する関数
export function projectToFirestore(project: Project): FirestoreProject {
  return {
    ...project,
    createdAt: project.createdAt.getTime(),
    updatedAt: project.updatedAt.getTime(),
    userId: project.ownerId,
  };
} 