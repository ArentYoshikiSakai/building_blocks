import { Vector3, Euler } from 'three';
import { Block as ExistingBlock, BlockType } from '../types';

// Firestoreに保存するためのブロック型
export interface FirestoreBlock {
  id: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  type: string; // Firestoreではenum値を文字列として保存
  color?: string;
  texture?: string;
}

// 既存のBlockをエクスポート
export type Block = ExistingBlock;

// Firestoreから取得したブロックをアプリで使用するBlock型に変換する関数
export function firestoreToBlock(firestoreBlock: FirestoreBlock): Block {
  return {
    id: firestoreBlock.id,
    type: firestoreBlock.type as BlockType,
    position: new Vector3(
      firestoreBlock.position.x,
      firestoreBlock.position.y,
      firestoreBlock.position.z
    ),
    rotation: new Euler(
      firestoreBlock.rotation?.x || 0,
      firestoreBlock.rotation?.y || 0,
      firestoreBlock.rotation?.z || 0
    ),
    scale: new Vector3(
      firestoreBlock.scale?.x || 1,
      firestoreBlock.scale?.y || 1,
      firestoreBlock.scale?.z || 1
    ),
    color: firestoreBlock.color || '#ffffff',
    properties: firestoreBlock.texture ? { texture: firestoreBlock.texture } : {}
  };
}

// アプリのBlock型をFirestore用に変換する関数
export function blockToFirestore(block: Block): FirestoreBlock {
  return {
    id: block.id,
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
    type: block.type,
    color: block.color,
    texture: block.properties?.texture
  };
} 