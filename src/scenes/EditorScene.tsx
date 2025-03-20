import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei';
import { Block as BlockComponent } from '../components/blocks/Block';
import { useBlockStore } from '../store/useBlockStore';
import { Vector3, Raycaster, Plane, Vector2 } from 'three';
import { BlockPalette } from '../components/ui/BlockPalette';
import { SettingsPanel } from '../components/ui/SettingsPanel';
import { BlockType } from '../types';

// スナップ用のユーティリティ関数
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// レイキャスト用のヘルパーコンポーネント
const DragDropHandler = ({ onPlaceBlock }: { onPlaceBlock: (position: Vector3) => void }) => {
  const { camera, gl } = useThree();
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0); // Y軸を上向きとした地面の平面
  const raycaster = new Raycaster();
  const { activeProject } = useBlockStore();
  
  // 位置のプレビュー表示用
  const [previewPosition, setPreviewPosition] = useState<Vector3 | null>(null);
  
  // ドラッグオーバーイベントのハンドラ
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    
    // マウス位置をキャンバス上の正規化座標に変換
    if (activeProject && e.clientX && e.clientY) {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // レイキャストして地面との交点を計算
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersectPoint = new Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectPoint);
      
      // グリッドサイズとスナップ設定に基づいて位置を調整
      if (activeProject.settings.snapToGrid) {
        const { gridSize } = activeProject.settings;
        intersectPoint.x = snapToGrid(intersectPoint.x, gridSize);
        intersectPoint.y = 0.5; // ブロックの高さの半分を地面から上に配置
        intersectPoint.z = snapToGrid(intersectPoint.z, gridSize);
      } else {
        intersectPoint.y = 0.5;
      }
      
      setPreviewPosition(intersectPoint);
    }
  }, [camera, gl, raycaster, activeProject]);
  
  // ドロップイベントのハンドラ
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    
    // dataTransferがnullでないことを確認
    if (!e.dataTransfer || !activeProject) return;
    
    // ブロックタイプとカラーを取得
    const blockType = e.dataTransfer.getData('blockType');
    const blockColor = e.dataTransfer.getData('blockColor');
    
    if (!blockType || !previewPosition) return;
    
    // 親コンポーネントに位置を通知
    onPlaceBlock(previewPosition);
    
    // プレビューをクリア
    setPreviewPosition(null);
  }, [activeProject, previewPosition, onPlaceBlock]);
  
  // ドラッグリーブイベントのハンドラ
  const handleDragLeave = useCallback(() => {
    setPreviewPosition(null);
  }, []);
  
  // キャンバスにイベントハンドラを追加・削除
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragleave', handleDragLeave);
    
    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragleave', handleDragLeave);
    };
  }, [gl, handleDragOver, handleDrop, handleDragLeave]);
  
  // 配置プレビューの表示
  if (previewPosition) {
    return (
      <mesh position={[previewPosition.x, previewPosition.y, previewPosition.z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="rgba(100, 149, 237, 0.5)" transparent opacity={0.5} />
      </mesh>
    );
  }
  
  return null;
};

export const EditorScene = () => {
  const { 
    activeProject, 
    addBlock, 
    updateBlockPosition,
    selectedBlockId,
    selectBlock,
    isDraggingBlock
  } = useBlockStore();
  
  const gridRef = useRef(null);
  const [dragBlockType, setDragBlockType] = useState<BlockType | null>(null);
  const [dragBlockColor, setDragBlockColor] = useState<string>('#f44336');
  
  // 地面クリックハンドラ
  const handleClick = (e: any) => {
    e.stopPropagation();
    // 地面クリックでブロックの選択を解除
    selectBlock(null);
  };
  
  // ブロックのドラッグを開始したときのハンドラ
  const handleBlockDragStart = (type: BlockType, color: string) => {
    setDragBlockType(type);
    setDragBlockColor(color);
  };
  
  // ブロックを配置するためのコールバック
  const handlePlaceBlock = (position: Vector3) => {
    if (!activeProject || !dragBlockType) return;
    addBlock(dragBlockType, position, dragBlockColor);
  };
  
  // ブロック移動時のスナップ機能
  const handleBlockMove = (id: string, position: Vector3) => {
    if (activeProject && activeProject.settings.snapToGrid) {
      const { gridSize } = activeProject.settings;
      const snappedPosition = new Vector3(
        snapToGrid(position.x, gridSize),
        position.y, // Y軸は変更しない
        snapToGrid(position.z, gridSize)
      );
      updateBlockPosition(id, snappedPosition);
    } else {
      updateBlockPosition(id, position);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* ブロックパレット */}
      <BlockPalette onDragStart={handleBlockDragStart} />
      
      {/* 設定パネル */}
      <SettingsPanel />
      
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* 背景色を設定 */}
        <color attach="background" args={[activeProject?.settings.backgroundColor || '#87CEEB']} />
        
        {/* グリッド表示 */}
        {activeProject?.settings.gridEnabled && (
          <gridHelper 
            args={[100, 100, "#444444", "#222222"]} 
            position={[0, 0, 0]}
            scale={[activeProject.settings.gridSize, 1, activeProject.settings.gridSize]}
          />
        )}
        
        {/* 地面 */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={handleClick}
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        
        {/* ブロックの描画 */}
        {activeProject?.blocks.map((block) => (
          <BlockComponent 
            key={block.id} 
            block={block} 
            onMove={handleBlockMove}
          />
        ))}
        
        {/* ドラッグ&ドロップハンドラ */}
        <DragDropHandler onPlaceBlock={handlePlaceBlock} />
        
        {/* カメラコントロール - ドラッグ中は無効化 */}
        <OrbitControls 
          enabled={!isDraggingBlock} 
          makeDefault 
        />
        
        {/* 環境光 */}
        <Environment preset={activeProject?.settings.lightingMode === 'day' ? 'sunset' : 'night'} />
      
        {/* 操作ガイド */}
        <Html position={[-15, 10, 0]}>
          <div className="usage-guide">
            <h3>Block World 操作方法</h3>
            <p>👆 パレットからブロックをドラッグして配置</p>
            <p>🔍 ブロックを選択してドラッグで移動</p>
            <p>🔄 選択したブロックを右クリックして回転</p>
            <p>❌ ブロックをダブルクリックで削除</p>
            <p>⚙️ 設定パネルでグリッド表示と吸着を調整</p>
          </div>
        </Html>
      </Canvas>
    </div>
  );
}; 