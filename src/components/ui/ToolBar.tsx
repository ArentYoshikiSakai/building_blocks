import { useState } from 'react';
import styles from './ToolBar.module.css';
import { useBlockStore } from '../../store/useBlockStore';

export type ToolType = 'select' | 'move' | 'rotate' | 'scale' | 'delete';

// ツールの色と詳細情報
const toolInfo = {
  select: { color: '#4dabf7', hoverColor: '#339af0', activeColor: '#1c7ed6', icon: '👆', label: '選択' },
  move: { color: '#51cf66', hoverColor: '#40c057', activeColor: '#2f9e44', icon: '✋', label: '移動' },
  rotate: { color: '#ff922b', hoverColor: '#fd7e14', activeColor: '#e8590c', icon: '🔄', label: '回転' },
  scale: { color: '#cc5de8', hoverColor: '#be4bdb', activeColor: '#ae3ec9', icon: '📏', label: 'サイズ' },
  delete: { color: '#ff6b6b', hoverColor: '#fa5252', activeColor: '#f03e3e', icon: '❌', label: '削除' }
};

interface ToolBarProps {
  onToolChange: (tool: ToolType) => void;
}

export const ToolBar = ({ onToolChange }: ToolBarProps) => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const { selectedBlockId, removeBlock } = useBlockStore();
  
  // ツール変更ハンドラ
  const handleToolChange = (tool: ToolType) => {
    // 削除ツールの場合は選択中のブロックを削除
    if (tool === 'delete' && selectedBlockId) {
      removeBlock(selectedBlockId);
      return;
    }

    setActiveTool(tool);
    onToolChange(tool);
  };
  
  // ツールボタンのリスト
  const tools = [
    { id: 'select', name: '選択', icon: '👆' },
    { id: 'move', name: '移動', icon: '✋' },
    { id: 'rotate', name: '回転', icon: '🔄' },
    { id: 'scale', name: 'サイズ変更', icon: '⚖️' },
    { id: 'delete', name: '削除', icon: '🗑️' },
  ] as const;

  return (
    <div className={styles.toolBar}>
      <div className={styles.toolsContainer}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolButton} ${activeTool === tool.id ? styles.active : ''}`}
            onClick={() => handleToolChange(tool.id)}
            title={tool.name}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolName}>{tool.name}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.helpSection}>
        <div className={styles.helpText}>
          {activeTool === 'select' && (
            <p>クリックでブロックを選択します。Deleteキーで削除できます。</p>
          )}
          {activeTool === 'move' && (
            <p>選択したブロックをドラッグで移動します。</p>
          )}
          {activeTool === 'rotate' && (
            <p>選択したブロックをドラッグで回転させます。</p>
          )}
          {activeTool === 'scale' && (
            <p>選択したブロックをドラッグして大きさを変更します。</p>
          )}
          {activeTool === 'delete' && (
            <p>ブロックをクリックするか、選択して Delete キーを押すと削除できます。</p>
          )}
        </div>
      </div>
    </div>
  );
};