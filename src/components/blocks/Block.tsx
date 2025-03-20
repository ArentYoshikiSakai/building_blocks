import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Block as BlockType } from '../../types';
import { useBlockStore } from '../../store/useBlockStore';
import { Vector3, Mesh, Raycaster, Plane, Euler } from 'three';

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
  
  const {
    selectedBlockId,
    selectBlock,
    updateBlockPosition,
    updateBlockRotation,
    updateBlockScale,
    removeBlock,
    setDraggingBlock,
    setRotatingBlock,
    setScalingBlock,
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
  useFrame(() => {
    if (!isSelected || !meshRef.current) return;
    
    // ドラッグ処理
    if (isDragging) {
      try {
        // 移動ロジック
        const blockRaycaster = new Raycaster();
        blockRaycaster.setFromCamera(mouse, camera);
        
        const intersectPoint = new Vector3();
        if (blockRaycaster.ray.intersectPlane(dragPlane.current, intersectPoint)) {
          // Y位置を保持
          intersectPoint.y = block.position.y;
          
          if (onMove) {
            onMove(block.id, intersectPoint);
          } else {
            updateBlockPosition(block.id, intersectPoint);
          }
        }
      } catch (error) {
        console.error('ドラッグ処理エラー:', error);
      }
    }
    
    // 回転処理
    if (isRotating && rotationStartPoint.current && originalRotation.current) {
      try {
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
      } catch (error) {
        console.error('回転処理エラー:', error);
      }
    }
    
    // サイズ変更処理
    if (isScaling && scaleStartPoint.current && originalScale.current) {
      try {
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
      } catch (error) {
        console.error('スケーリング処理エラー:', error);
      }
    }
  });
  
  // ブロックの形状に基づいて適切なメッシュを返す関数
  const renderBlockMesh = () => {
    try {
      switch (block.type) {
        case 'cube':
          return <boxGeometry args={[1, 1, 1]} />;
        case 'rectangle':
          return <boxGeometry args={[2, 1, 1]} />;
        case 'cylinder':
          return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
        case 'triangle':
          return <cylinderGeometry args={[0, 1, 1, 4, 1]} />;
        case 'arch':
          return <cylinderGeometry args={[0.5, 0.5, 1, 32, 1, false, 0, Math.PI]} />;
        case 'wheel':
          return (
            <group rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
            </group>
          );
        case 'window':
          return <boxGeometry args={[1, 1, 0.1]} />;
        case 'door':
          return <boxGeometry args={[1, 2, 0.1]} />;
        default:
          return <boxGeometry args={[1, 1, 1]} />;
      }
    } catch (error) {
      console.error('ジオメトリのレンダリングエラー:', error);
      return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  const handlePointerDown = (e: React.PointerEvent) => {
    try {
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
        setScalingBlock(true); // グローバルなスケーリング状態を更新
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
    } catch (error) {
      console.error('ポインタダウン処理エラー:', error);
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    try {
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
        setScalingBlock(false); // グローバルなスケーリング状態を更新
        gl.domElement.style.cursor = 'auto';
      }
      
      // ドラッグモードが終了
      if (isDragging) {
        setIsDragging(false);
        setDraggingBlock(false); // グローバルなドラッグ状態を更新
        gl.domElement.style.cursor = 'auto';
      }
      
      isPointerDown.current = false;
      dragStartPoint.current = null;
      rotationStartPoint.current = null;
      scaleStartPoint.current = null;
    } catch (error) {
      console.error('ポインタアップ処理エラー:', error);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTimeRef.current;
      
      // ダブルクリック検出
      if (timeDiff < clickDelay) {
        // ダブルクリックを検出した場合は何もしない
        lastClickTimeRef.current = 0; // リセット
        return;
      }
      
      // クリック時間を更新
      lastClickTimeRef.current = currentTime;
      
      // 削除ツールがアクティブな場合はブロックを削除
      if (activeTool === 'delete') {
        removeBlock(block.id);
        return;
      }
      
      // 通常のクリックはブロックを選択
      selectBlock(block.id);
    } catch (error) {
      console.error('クリック処理エラー:', error);
    }
  };
  
  // カーソルスタイルの取得
  const getCursorStyle = () => {
    if (isDragging) return 'grabbing';
    if (isRotating) return 'move';
    if (isScaling) return 'ns-resize';
    if (hovered) return 'pointer';
    return 'auto';
  };
  
  return (
    <mesh
      ref={meshRef}
      position={[block.position.x, block.position.y, block.position.z]}
      rotation={[block.rotation.x, block.rotation.y, block.rotation.z]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {renderBlockMesh()}
      <meshStandardMaterial 
        color={block.color} 
        metalness={0.1}
        roughness={0.5}
        emissive={hovered || isSelected ? "#ffffff" : "#000000"}
        emissiveIntensity={hovered || isSelected ? 0.1 : 0}
        transparent={block.type === 'window'}
        opacity={block.type === 'window' ? 0.6 : 1}
      />
    </mesh>
  );
}; 