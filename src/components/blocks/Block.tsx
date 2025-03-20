import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Block as BlockType } from '../../types';
import { useBlockStore } from '../../store/useBlockStore';
import { Vector3, Mesh } from 'three';

interface BlockProps {
  block: BlockType;
}

export const Block = ({ block }: BlockProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const {
    selectedBlockId,
    selectBlock,
    updateBlockPosition,
    updateBlockRotation,
    removeBlock
  } = useBlockStore();
  
  const isSelected = selectedBlockId === block.id;
  
  // 選択状態の場合、ハイライト効果を適用
  useFrame(() => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.lerp(new Vector3(1.05, 1.05, 1.05), 0.1);
      } else {
        meshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
      }
    }
  });
  
  // ブロックの形状に基づいて適切なメッシュを返す関数
  const renderBlockMesh = () => {
    switch (block.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'rectangle':
        return <boxGeometry args={[2, 1, 1]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'triangle':
        return (
          <cylinderGeometry args={[0, 1, 1, 4, 1]} />
        );
      case 'arch':
        // 簡易的な半円形状
        return (
          <cylinderGeometry args={[0.5, 0.5, 1, 32, 1, false, 0, Math.PI]} />
        );
      case 'wheel':
        // 車輪は横向きの円柱
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
          </group>
        );
      case 'window':
        // 窓は立方体ですが、後で細部を追加
        return <boxGeometry args={[1, 1, 0.1]} />;
      case 'door':
        // ドアは長方形ですが、後で細部を追加
        return <boxGeometry args={[1, 2, 0.1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Shiftキーを押しながらクリックで削除
      removeBlock(block.id);
    } else {
      // 通常クリックで選択
      setClicked(!clicked);
      selectBlock(isSelected ? null : block.id);
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ダブルクリックで削除
    removeBlock(block.id);
  };
  
  return (
    <mesh
      ref={meshRef}
      position={[block.position.x, block.position.y, block.position.z]}
      rotation={[block.rotation.x, block.rotation.y, block.rotation.z]}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderBlockMesh()}
      <meshStandardMaterial 
        color={hovered ? '#ff9e00' : isSelected ? '#1e88e5' : block.color} 
        wireframe={false}
        transparent={block.type === 'window'}
        opacity={block.type === 'window' ? 0.5 : 1}
      />
    </mesh>
  );
}; 