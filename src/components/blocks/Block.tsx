import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Block as BlockType } from '../../types';
import { useBlockStore } from '../../store/useBlockStore';
import { Vector3, Mesh, Raycaster, Plane, Euler, MathUtils } from 'three';
import { createPortal } from 'react-dom';
import { ContextMenu } from '../ui/ContextMenu';

interface BlockProps {
  block: BlockType;
  onMove?: (id: string, position: Vector3) => void;
}

export const Block = ({ block, onMove }: BlockProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  
  // コンテキストメニュー用の状態
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const {
    selectedBlockId,
    selectBlock,
    updateBlockPosition,
    updateBlockRotation,
    removeBlock,
    setDraggingBlock
  } = useBlockStore();
  
  const isSelected = selectedBlockId === block.id;
  
  // ドラッグ用の参照ポイント
  const dragStartPoint = useRef<{ x: number; y: number } | null>(null);
  const dragPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const originalPosition = useRef<Vector3 | null>(null);
  const isPointerDown = useRef(false);
  
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
  
  // ドラッグハンドリング
  useFrame(({ camera, mouse }) => {
    if (!isDragging || !isSelected || !meshRef.current) return;
    
    // 地面との交点を計算
    const blockRaycaster = new Raycaster();
    blockRaycaster.setFromCamera(mouse, camera);
    
    const intersectPoint = new Vector3();
    blockRaycaster.ray.intersectPlane(dragPlane.current, intersectPoint);
    
    // Y位置を保持
    intersectPoint.y = block.position.y;
    
    // onMoveコールバックが提供されていれば使用する
    if (onMove) {
      onMove(block.id, intersectPoint);
    } else {
      updateBlockPosition(block.id, intersectPoint);
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
  
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isPointerDown.current = true;
    
    // 単一のクリックで選択する
    if (!isSelected) {
      selectBlock(block.id);
      return;
    }
    
    // 選択済みなら即ドラッグ開始
    setIsDragging(true);
    setDraggingBlock(true); // グローバルなドラッグ状態を更新
    gl.domElement.style.cursor = 'grabbing';
    
    // 元の位置を保存
    originalPosition.current = block.position.clone();
    
    // ドラッグする平面を設定（ブロックのY位置に合わせる）
    dragPlane.current = new Plane(new Vector3(0, 1, 0), -block.position.y);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    
    // ドラッグ操作が行われていた場合のみ終了処理
    if (isDragging) {
      setIsDragging(false);
      setDraggingBlock(false); // グローバルなドラッグ状態を更新
      gl.domElement.style.cursor = 'auto';
    }
    
    isPointerDown.current = false;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Shiftキーを押しながらクリックで削除
    if (e.shiftKey) {
      removeBlock(block.id);
      return;
    }
    
    // クリックでの選択解除は、ダブルクリックで行うようにする
    // または、明示的に別のブロックや地面をクリックしたときに解除される
    
    // 注: 以下のコードをコメントアウトすることで、クリックのみでは選択解除しないようにする
    /*
    if (isSelected && !isDragging) {
      selectBlock(null);
    }
    */
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ダブルクリックで削除
    removeBlock(block.id);
  };
  
  // 右クリックハンドラ - コンテキストメニューを表示
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 先にブロックを選択
    if (!isSelected) {
      selectBlock(block.id);
    }
    
    // コンテキストメニューの位置を設定
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  
  // コンテキストメニューを閉じる
  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };
  
  // 回転処理
  const handleRotate = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    // 現在の回転を取得
    const currentRotation = new Euler(
      block.rotation.x,
      block.rotation.y,
      block.rotation.z
    );
    
    // 90度（π/2ラジアン）回転
    const rotationAmount = Math.PI / 2 * direction;
    
    // 指定した軸に対して回転
    if (axis === 'x') {
      currentRotation.x = MathUtils.euclideanModulo(currentRotation.x + rotationAmount, Math.PI * 2);
    } else if (axis === 'y') {
      currentRotation.y = MathUtils.euclideanModulo(currentRotation.y + rotationAmount, Math.PI * 2);
    } else if (axis === 'z') {
      currentRotation.z = MathUtils.euclideanModulo(currentRotation.z + rotationAmount, Math.PI * 2);
    }
    
    // 回転を更新
    updateBlockRotation(block.id, currentRotation);
  };
  
  // ドキュメント全体のポインターイベントを処理
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    
    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggingBlock(false); // グローバルなドラッグ状態を更新
        gl.domElement.style.cursor = 'auto';
      }
      isPointerDown.current = false;
    };
    
    // ドラッグ中はイベントをグローバルに追加
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, gl, setDraggingBlock]);
  
  return (
    <>
      <mesh
        ref={meshRef}
        position={[block.position.x, block.position.y, block.position.z]}
        rotation={[block.rotation.x, block.rotation.y, block.rotation.z]}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {renderBlockMesh()}
        <meshStandardMaterial 
          color={isDragging ? '#ff0000' : hovered ? '#ff9e00' : isSelected ? '#1e88e5' : block.color} 
          wireframe={false}
          transparent={block.type === 'window'}
          opacity={block.type === 'window' ? 0.5 : 1}
        />
      </mesh>
      
      {/* コンテキストメニュー */}
      {showContextMenu && createPortal(
        <ContextMenu 
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onRotate={handleRotate}
        />,
        document.body
      )}
    </>
  );
}; 