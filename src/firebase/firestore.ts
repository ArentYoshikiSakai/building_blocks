import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import { Project, FirestoreProject, firestoreToProject, projectToFirestore } from '../models/Project';
import { Block, FirestoreBlock, firestoreToBlock, blockToFirestore } from '../models/Block';
import { getCurrentUser } from './auth';

// プロジェクトコレクションの参照
const projectsRef = collection(db, 'projects');

// プロジェクトをFirestoreに保存するための型
interface FirestoreProject {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  ownerId: string;
  ownerEmail: string | null;
  blocks: any[]; // ブロックデータ
  settings: any; // プロジェクト設定
}

// Projectオブジェクトをファイアストア用に変換
const projectToFirestore = (project: Project): Omit<FirestoreProject, 'id'> => {
  const user = getCurrentUser();
  
  return {
    name: project.name,
    createdAt: Timestamp.fromDate(project.createdAt),
    updatedAt: Timestamp.fromDate(new Date()),
    isPublic: project.isPublic,
    ownerId: user?.uid || 'anonymous',
    ownerEmail: user?.email,
    blocks: project.blocks.map(block => ({
      type: block.type,
      position: {
        x: block.position.x,
        y: block.position.y,
        z: block.position.z
      },
      rotation: {
        x: block.rotation.x,
        y: block.rotation.y,
        z: block.rotation.z
      },
      scale: {
        x: block.scale.x,
        y: block.scale.y,
        z: block.scale.z
      },
      color: block.color
    })),
    settings: project.settings
  };
};

// プロジェクトの作成
export const createProject = async (project: Project): Promise<string> => {
  try {
    // Firestore用にプロジェクトデータを変換
    const firestoreProject: FirestoreProject = projectToFirestore(project);
    
    // ブロックデータもFirestore形式に変換
    const firestoreBlocks = project.blocks.map(block => blockToFirestore(block));
    
    // Firestoreにプロジェクトを追加
    const projectData = {
      ...firestoreProject,
      blocks: firestoreBlocks
    };
    
    const docRef = await addDoc(projectsRef, projectData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('プロジェクトの作成に失敗しました');
  }
};

// プロジェクトの更新
export const updateProject = async (project: Project): Promise<void> => {
  try {
    // プロジェクトのドキュメント参照を取得
    const projectRef = doc(db, 'projects', project.id);
    
    // Firestore用にプロジェクトデータを変換
    const firestoreProject = projectToFirestore(project);
    
    // ブロックデータもFirestore形式に変換
    const firestoreBlocks = project.blocks.map(block => blockToFirestore(block));
    
    // Firestoreでプロジェクトを更新
    await updateDoc(projectRef, {
      ...firestoreProject,
      blocks: firestoreBlocks,
      updatedAt: Date.now() // 更新時間を現在時刻に設定
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('プロジェクトの更新に失敗しました');
  }
};

// プロジェクトの削除
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    // プロジェクトのドキュメント参照を取得
    const projectRef = doc(db, 'projects', projectId);
    
    // Firestoreからプロジェクトを削除
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('プロジェクトの削除に失敗しました');
  }
};

// プロジェクトの取得
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    // プロジェクトのドキュメント参照を取得
    const projectRef = doc(db, 'projects', projectId);
    
    // プロジェクトドキュメントを取得
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const projectData = projectSnap.data() as FirestoreProject;
      
      // ブロックデータをアプリ形式に変換
      const blocks = projectData.blocks.map(blockData => 
        firestoreToBlock(blockData as unknown as FirestoreBlock)
      );
      
      // プロジェクトデータをアプリ形式に変換
      const project = firestoreToProject({
        ...projectData,
        id: projectSnap.id,
        blocks: [] // 一旦空の配列を入れる（後で上書き）
      });
      
      // ブロックデータを設定
      project.blocks = blocks;
      
      return project;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw new Error('プロジェクトの取得に失敗しました');
  }
};

// ユーザーのプロジェクト一覧の取得
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    // ユーザーIDに基づいてプロジェクトをクエリ
    const q = query(projectsRef, where('userId', '==', userId));
    
    // クエリを実行
    const querySnapshot = await getDocs(q);
    
    // 結果を変換
    const projects: Project[] = [];
    
    querySnapshot.forEach(docSnap => {
      const projectData = docSnap.data() as FirestoreProject;
      
      // プロジェクトデータをアプリ形式に変換（ブロックは含めない - サマリーのみ）
      const project = firestoreToProject({
        ...projectData,
        id: docSnap.id,
        blocks: [] // サマリーなのでブロックは含めない
      });
      
      projects.push(project);
    });
    
    // 更新日時の降順でソート
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting user projects:', error);
    throw new Error('プロジェクト一覧の取得に失敗しました');
  }
};

// 公開プロジェクト一覧の取得
export const getPublicProjects = async (): Promise<Project[]> => {
  try {
    // 公開プロジェクトをクエリ
    const q = query(projectsRef, where('isPublic', '==', true));
    
    // クエリを実行
    const querySnapshot = await getDocs(q);
    
    // 結果を変換
    const projects: Project[] = [];
    
    querySnapshot.forEach(docSnap => {
      const projectData = docSnap.data() as FirestoreProject;
      
      // プロジェクトデータをアプリ形式に変換（ブロックは含めない - サマリーのみ）
      const project = firestoreToProject({
        ...projectData,
        id: docSnap.id,
        blocks: [] // サマリーなのでブロックは含めない
      });
      
      projects.push(project);
    });
    
    // 更新日時の降順でソート
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting public projects:', error);
    throw new Error('公開プロジェクト一覧の取得に失敗しました');
  }
}; 