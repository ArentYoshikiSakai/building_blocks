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
  moveOnly?: boolean;
  rotateOnly?: boolean;
  scaleOnly?: boolean;
}

export const Block = ({ block, onMove, moveOnly, rotateOnly, scaleOnly }: BlockProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const { camera, gl, mouse } = useThree();
  
  // ダブルクリック検出のための状態
  const lastClickTimeRef = useRef<number>(0);
  const clickDelay = 300; // ミリ秒単位でのダブルクリック検出の時間枠
  
  // コンテキストメニュー用の状態
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const {
    selectedBlockId,
    selectBlock,
    updateBlockPosition,
    updateBlockRotation,
    updateBlockScale,
    removeBlock,
    setDraggingBlock,
    setRotatingBlock,
    activeTool
  } = useBlockStore();
  
  const isSelected = selectedBlockId === block.id;
  
  // ドラッグ/回転/スケール用の参照ポイント
  const dragStartPoint = useRef<{ x: number; y: number } | null>(null);
  const rotationStartPoint = useRef<{ x: number; y: number } | null>(null);
  const scaleStartPoint = useRef<{ x: number; y: number } | null>(null);
  const dragPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const originalPosition = useRef<Vector3 | null>(null);
  const originalRotation = useRef<Euler | null>(null);
  const originalScale = useRef<Vector3 | null>(null);
  const isPointerDown = useRef(false);
  
  // 選択状態の場合、ハイライト効果を適用
  useFrame(() => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.lerp(
          new Vector3(
            1.05 * block.scale.x, 
            1.05 * block.scale.y, 
            1.05 * block.scale.z
          ), 
          0.1
        );
      } else {
        meshRef.current.scale.lerp(block.scale, 0.1);
      }
    }
  });
  
  // フレーム毎の処理 (ドラッグ、回転、拡大縮小)
  useFrame(({ camera, mouse }) => {
    if (!isSelected || !meshRef.current) return;
    
    // ドラッグ処理
    if (isDragging) {
      // 移動ロジック（従来通り）
      const blockRaycaster = new Raycaster();
      blockRaycaster.setFromCamera(mouse, camera);
      
      const intersectPoint = new Vector3();
      blockRaycaster.ray.intersectPlane(dragPlane.current, intersectPoint);
      
      // Y位置を保持
      intersectPoint.y = block.position.y;
      
      if (onMove) {
        onMove(block.id, intersectPoint);
      } else {
        updateBlockPosition(block.id, intersectPoint);
      }
    }
    
    // 回転処理
    if (isRotating && rotationStartPoint.current && originalRotation.current) {
      // 回転ロジック
      const deltaX = mouse.x - rotationStartPoint.current.x;
      const deltaY = mouse.y - rotationStartPoint.current.y;
      
      // 現在の回転を取得
      const currentRotation = new Euler(
        originalRotation.current.x,
        originalRotation.current.y,
        originalRotation.current.z
      );
      
      // X軸の回転（上下のマウス移動で回転）
      currentRotation.x = originalRotation.current.x + deltaY * 5;
      
      // Y軸の回転（左右のマウス移動で回転）
      currentRotation.y = originalRotation.current.y - deltaX * 5;
      
      // 回転を適用
      updateBlockRotation(block.id, currentRotation);
    }
    
    // サイズ変更処理
    if (isScaling && scaleStartPoint.current && originalScale.current) {
      // スケーリングロジック
      const deltaY = mouse.y - scaleStartPoint.current.y;
      
      // スケールを計算 (上下の移動でスケール変更)
      const scaleFactor = 1 - deltaY * 2;
      const newScale = new Vector3(
        originalScale.current.x * scaleFactor,
        originalScale.current.y * scaleFactor,
        originalScale.current.z * scaleFactor
      );
      
      // 最小値と最大値を制限
      newScale.x = Math.max(0.2, Math.min(newScale.x, 3));
      newScale.y = Math.max(0.2, Math.min(newScale.y, 3));
      newScale.z = Math.max(0.2, Math.min(newScale.z, 3));
      
      // スケールを適用
      updateBlockScale(block.id, newScale);
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
    
    // 未選択の場合はまず選択
    if (!isSelected) {
      selectBlock(block.id);
      return;
    }
    
    // 右クリック（button=2）の場合は回転モードを開始
    if (e.button === 2 || rotateOnly) {
      // 回転モードを開始
      setIsRotating(true);
      setRotatingBlock(true); // グローバルな回転状態を更新
      gl.domElement.style.cursor = 'move';
      
      // 元の回転と開始位置を保存
      originalRotation.current = new Euler(
        block.rotation.x,
        block.rotation.y,
        block.rotation.z
      );
      rotationStartPoint.current = { x: mouse.x, y: mouse.y };
      
      return;
    }
    
    // Shiftキーを押しながらドラッグ、またはスケールモードの場合はサイズ変更
    if ((e.shiftKey && activeTool === 'select') || scaleOnly) {
      // サイズ変更モードを開始
      setIsScaling(true);
      gl.domElement.style.cursor = 'ns-resize';
      
      // 元のスケールと開始位置を保存
      originalScale.current = new Vector3(
        block.scale.x,
        block.scale.y,
        block.scale.z
      );
      scaleStartPoint.current = { x: mouse.x, y: mouse.y };
      
      return;
    }
    
    // アクティブツールに応じた処理
    if (activeTool === 'select' || activeTool === 'move' || moveOnly) {
      // ドラッグ開始
      setIsDragging(true);
      setDraggingBlock(true); // グローバルなドラッグ状態を更新
      gl.domElement.style.cursor = 'grabbing';
      
      // 元の位置を保存
      originalPosition.current = block.position.clone();
      
      // ドラッグする平面を設定（ブロックのY位置に合わせる）
      dragPlane.current = new Plane(new Vector3(0, 1, 0), -block.position.y);
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    
    // 回転モードが終了
    if (isRotating) {
      setIsRotating(false);
      setRotatingBlock(false); // グローバルな回転状態を更新
      gl.domElement.style.cursor = 'auto';
    }
    
    // サイズ変更モードが終了
    if (isScaling) {
      setIsScaling(false);
      gl.domElement.style.cursor = 'auto';
    }
    
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
    
    // 現在の時間を取得
    const currentTime = new Date().getTime();
    
    // ダブルクリックかどうかチェック
    const isDoubleClick = currentTime - lastClickTimeRef.current < clickDelay;
    
    // クリック時間を更新
    lastClickTimeRef.current = currentTime;
    
    // ダブルクリックの場合は何もしない
    if (isDoubleClick) {
      return;
    }
    
    // 削除ツールが選択されている場合は削除
    if (activeTool === 'delete') {
      removeBlock(block.id);
      return;
    }
    
    // Shiftキーを押しながらクリックで削除
    if (e.shiftKey && activeTool === 'select') {
      removeBlock(block.id);
      return;
    }
  };
  
  // 右クリックハンドラ - 右クリック＋ドラッグ回転のためにデフォルトのメニュー表示を防止
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // コンテキストメニューは表示しない（右クリック＋ドラッグで直接回転するため）
  };
  
  // ドキュメント全体のポインターイベントを処理
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging || isRotating || isScaling) {
        e.preventDefault();
      }
    };
    
    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggingBlock(false); // グローバルなドラッグ状態を更新
        gl.domElement.style.cursor = 'auto';
      }
      
      if (isRotating) {
        setIsRotating(false);
        setRotatingBlock(false); // グローバルな回転状態を更新
        gl.domElement.style.cursor = 'auto';
      }
      
      if (isScaling) {
        setIsScaling(false);
        gl.domElement.style.cursor = 'auto';
      }
      
      isPointerDown.current = false;
    };
    
    // イベントをグローバルに追加
    if (isDragging || isRotating || isScaling) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      // 右クリックメニュー無効化
      if (isRotating) {
        const preventContextMenu = (e: MouseEvent) => {
          e.preventDefault();
        };
        document.addEventListener('contextmenu', preventContextMenu);
        return () => {
          document.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerup', handlePointerUp);
          document.removeEventListener('contextmenu', preventContextMenu);
        };
      }
    }
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isRotating, isScaling, gl, setDraggingBlock, setRotatingBlock]);
  
  // ブロックの色を決定
  const getBlockColor = () => {
    if (isRotating) return '#00cc00';  // 回転中は緑色
    if (isScaling) return '#9c27b0';   // サイズ変更中は紫色
    if (isDragging) return '#ff0000';  // ドラッグ中は赤色
    if (hovered) return '#ff9e00';     // ホバー中はオレンジ色
    if (isSelected) return '#1e88e5';  // 選択中は青色
    return block.color;                // デフォルトは設定色
  };
  
  // ツールに基づいたカーソルスタイルを取得
  const getCursorStyle = () => {
    switch (activeTool) {
      case 'move': return 'move';
      case 'rotate': return 'alias';
      case 'scale': return 'ns-resize';
      case 'delete': return 'not-allowed';
      default: return 'pointer';
    }
  };
  
  // マウスホバー時のカーソル設定
  const handlePointerOver = () => {
    setHovered(true);
    gl.domElement.style.cursor = getCursorStyle();
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    gl.domElement.style.cursor = 'auto';
  };
  
  return (
    <>
      <mesh
        ref={meshRef}
        position={[block.position.x, block.position.y, block.position.z]}
        rotation={[block.rotation.x, block.rotation.y, block.rotation.z]}
        scale={[block.scale.x, block.scale.y, block.scale.z]}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {renderBlockMesh()}
        <meshStandardMaterial 
          color={getBlockColor()} 
          wireframe={false}
          transparent={block.type === 'window'}
          opacity={block.type === 'window' ? 0.5 : 1}
        />
      </mesh>
    </>
  );
}; 