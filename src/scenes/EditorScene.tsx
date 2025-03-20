import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Block } from '../components/blocks/Block';
import { useBlockStore } from '../store/useBlockStore';
import { Vector3, Raycaster, Plane, Vector2 } from 'three';
import { BlockPalette } from '../components/ui/BlockPalette';
import { BlockType } from '../types';

// レイキャスト用のヘルパーコンポーネント
const DragDropHandler = ({ onPlaceBlock }: { onPlaceBlock: (position: Vector3) => void }) => {
  const { camera, gl } = useThree();
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0); // Y軸を上向きとした地面の平面
  const raycaster = new Raycaster();
  
  // ドラッグオーバーイベントのハンドラ
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);
  
  // ドロップイベントのハンドラ
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    
    // dataTransferがnullでないことを確認
    if (!e.dataTransfer) return;
    
    // ブロックタイプとカラーを取得
    const blockType = e.dataTransfer.getData('blockType');
    const blockColor = e.dataTransfer.getData('blockColor');
    
    if (!blockType) return;
    
    // マウス位置をキャンバス上の正規化座標に変換
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // レイキャストして地面との交点を計算
    raycaster.setFromCamera(new Vector2(x, y), camera);
    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    
    // グリッドにスナップ（整数値に丸める）
    intersectPoint.x = Math.round(intersectPoint.x);
    intersectPoint.y = 0.5; // ブロックの高さの半分を地面から上に配置
    intersectPoint.z = Math.round(intersectPoint.z);
    
    // 親コンポーネントに位置を通知
    onPlaceBlock(intersectPoint);
  }, [camera, gl, raycaster, onPlaceBlock]);
  
  // キャンバスにイベントハンドラを追加・削除
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    
    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, [gl, handleDragOver, handleDrop]);
  
  return null;
};

export const EditorScene = () => {
  const { activeProject, addBlock } = useBlockStore();
  const gridRef = useRef(null);
  const [dragBlockType, setDragBlockType] = useState<BlockType | null>(null);
  const [dragBlockColor, setDragBlockColor] = useState<string>('#f44336');
  
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
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* ブロックパレット */}
      <BlockPalette onDragStart={handleBlockDragStart} />
      
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* 背景色を設定 */}
        <color attach="background" args={[activeProject?.settings.backgroundColor || '#87CEEB']} />
        
        {/* グリッド表示 */}
        {activeProject?.settings.gridEnabled && (
          <Grid
            ref={gridRef}
            infiniteGrid
            cellSize={activeProject.settings.gridSize}
            fadeDistance={50}
            fadeStrength={1.5}
          />
        )}
        
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#8a8a8a" />
        </mesh>
        
        {/* ブロックの描画 */}
        {activeProject?.blocks.map((block) => (
          <Block key={block.id} block={block} />
        ))}
        
        {/* ドラッグ&ドロップハンドラ */}
        <DragDropHandler onPlaceBlock={handlePlaceBlock} />
        
        {/* カメラコントロール */}
        <OrbitControls makeDefault />
        
        {/* 環境光 */}
        <Environment preset={activeProject?.settings.lightingMode === 'day' ? 'sunset' : 'night'} />
      </Canvas>
      
      {/* 使い方ガイド */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        right: '10px', 
        background: 'rgba(255,255,255,0.7)', 
        padding: '10px', 
        borderRadius: '5px' 
      }}>
        <p>🖱️ 左側のブロックをドラッグして3D空間に配置</p>
        <p>👆 ブロックをクリックして選択</p>
        <p>✨ Shiftキー+クリックでブロックを削除</p>
      </div>
    </div>
  );
}; 