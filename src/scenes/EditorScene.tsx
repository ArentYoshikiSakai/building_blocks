import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei';
import { Block as BlockComponent } from '../components/blocks/Block';
import { useBlockStore } from '../store/useBlockStore';
import { Vector3, Raycaster, Plane, Vector2 } from 'three';
import { BlockPalette } from '../components/ui/BlockPalette';
import { SettingsPanel } from '../components/ui/SettingsPanel';
import { ToolBar, ToolType } from '../components/ui/ToolBar';
import { HelpGuide } from '../components/ui/HelpGuide';
import { BlockType } from '../types';

// カラーマッピング
const colorMap: Record<string, string> = {
  grass: '#7cba3f',
  sand: '#e6d59e',
  stone: '#a7a7a7',
  wood: '#8b5a2b',
};

// スナップ用のユーティリティ関数
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// 地面コンポーネント
const Ground = ({ texture = 'grass', onClick }: { texture: string; onClick: (e: any) => void }) => {
  // 指定されたテクスチャに対応する色を取得
  const groundColor = colorMap[texture as keyof typeof colorMap] || '#7cba3f';
  
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={onClick}
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={groundColor} />
    </mesh>
  );
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
    updateBlockRotation,
    updateBlockScale,
    selectedBlockId,
    selectBlock,
    isDraggingBlock,
    isRotatingBlock,
    activeTool,
    setActiveTool,
    removeBlock
  } = useBlockStore();
  
  const gridRef = useRef(null);
  const [dragBlockType, setDragBlockType] = useState<BlockType | null>(null);
  const [dragBlockColor, setDragBlockColor] = useState<string>('#f44336');
  
  // キーボードイベントハンドラを追加
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DeleteキーまたはBackspaceキーでブロック削除
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        console.log(`Deleting block with ID: ${selectedBlockId}`);
        removeBlock(selectedBlockId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBlockId, removeBlock]);
  
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
  
  // ツール変更ハンドラ
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
  };
  
  // フォーカスされたブロックに対して操作を適用するヘルパー関数
  const applyOperationToSelectedBlock = (operation: 'move' | 'rotate' | 'scale', value: any) => {
    if (!selectedBlockId || !activeProject) return;
    
    const block = activeProject.blocks.find(b => b.id === selectedBlockId);
    if (!block) return;
    
    switch (operation) {
      case 'move':
        updateBlockPosition(selectedBlockId, value);
        break;
      case 'rotate':
        updateBlockRotation(selectedBlockId, value);
        break;
      case 'scale':
        updateBlockScale(selectedBlockId, value);
        break;
    }
  };
  
  // ブロック操作のハンドラをツールに応じて設定
  const getBlockInteractionProps = (block: any) => {
    // アクティブツールに応じた操作プロパティを返す
    const props: any = {};
    
    switch (activeTool) {
      case 'select':
        // 選択モード - デフォルトの選択動作
        break;
      case 'move':
        // 移動モード - 移動コールバックのみ有効
        props.moveOnly = true;
        break;
      case 'rotate':
        // 回転モード - 回転コールバックのみ有効
        props.rotateOnly = true;
        break;
      case 'scale':
        // サイズ変更モード - スケールコールバックのみ有効
        props.scaleOnly = true;
        break;
    }
    
    return props;
  };
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* ブロックパレット */}
      <BlockPalette onDragStart={handleBlockDragStart} />
      
      {/* 設定パネル */}
      <SettingsPanel />
      
      {/* ツールバー */}
      <ToolBar onToolChange={handleToolChange} />
      
      {/* ヘルプガイド */}
      <HelpGuide />
      
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
        {activeProject && (
          <Ground 
            texture={activeProject.settings.groundTexture} 
            onClick={handleClick} 
          />
        )}
        
        {/* ブロックの描画 */}
        {activeProject?.blocks.map((block) => (
          <BlockComponent 
            key={block.id} 
            block={block} 
            onMove={handleBlockMove}
            {...getBlockInteractionProps(block)}
          />
        ))}
        
        {/* ドラッグ&ドロップハンドラ */}
        <DragDropHandler onPlaceBlock={handlePlaceBlock} />
        
        {/* カメラコントロール - ドラッグ中または回転中は無効化 */}
        <OrbitControls 
          enabled={!isDraggingBlock && !isRotatingBlock} 
          makeDefault 
        />
        
        {/* 環境光 */}
        <Environment preset={activeProject?.settings.lightingMode === 'day' ? 'sunset' : 'night'} />
      </Canvas>
    </div>
  );
}; 