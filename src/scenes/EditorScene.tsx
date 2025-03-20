import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Block } from '../components/blocks/Block';
import { useBlockStore } from '../store/useBlockStore';
import { Vector3 } from 'three';

export const EditorScene = () => {
  const { activeProject, addBlock } = useBlockStore();
  const gridRef = useRef(null);

  const handleAddBlock = (e: React.MouseEvent, type: 'cube' | 'rectangle' | 'cylinder' | 'triangle' | 'arch') => {
    if (!activeProject) return;
    
    // 地面に新しいブロックを追加
    // 実際のアプリケーションではクリック位置を正確に計算する必要があります
    const position = new Vector3(
      Math.floor(Math.random() * 10) - 5,
      0.5, // 地面の上に配置
      Math.floor(Math.random() * 10) - 5
    );
    
    addBlock(type, position, '#' + Math.floor(Math.random() * 16777215).toString(16));
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
        <button onClick={(e) => handleAddBlock(e, 'cube')}>立方体を追加</button>
        <button onClick={(e) => handleAddBlock(e, 'rectangle')}>直方体を追加</button>
        <button onClick={(e) => handleAddBlock(e, 'cylinder')}>円柱を追加</button>
        <button onClick={(e) => handleAddBlock(e, 'triangle')}>三角形を追加</button>
        <button onClick={(e) => handleAddBlock(e, 'arch')}>アーチを追加</button>
      </div>
      
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
        
        {/* カメラコントロール */}
        <OrbitControls makeDefault />
        
        {/* 環境光 */}
        <Environment preset={activeProject?.settings.lightingMode === 'day' ? 'sunset' : 'night'} />
      </Canvas>
    </div>
  );
}; 