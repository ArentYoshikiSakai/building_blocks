import { useState } from 'react';
import styled from 'styled-components';
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
  onToolChange?: (tool: ToolType) => void;
}

export const ToolBar = ({ onToolChange }: ToolBarProps) => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const { selectedBlockId, removeBlock } = useBlockStore();

  const handleToolClick = (tool: ToolType) => {
    // 削除ツールの場合は選択中のブロックを削除
    if (tool === 'delete' && selectedBlockId) {
      removeBlock(selectedBlockId);
      return;
    }

    setActiveTool(tool);
    if (onToolChange) {
      onToolChange(tool);
    }
  };

  return (
    <ToolBarContainer>
      <ToolsTitle>ツール</ToolsTitle>
      <ToolsWrapper>
        {(Object.keys(toolInfo) as ToolType[]).map(tool => (
          <ToolButton 
            key={tool}
            active={activeTool === tool} 
            onClick={() => handleToolClick(tool)}
            disabled={tool !== 'select' && tool !== 'delete' && !selectedBlockId}
            toolType={tool}
            title={`${toolInfo[tool].label}ツール`}
          >
            <ToolIcon className={`icon-${tool}`}>{toolInfo[tool].icon}</ToolIcon>
            <ToolLabel>{toolInfo[tool].label}</ToolLabel>
          </ToolButton>
        ))}
      </ToolsWrapper>
    </ToolBarContainer>
  );
};

const ToolBarContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 30px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  border: 3px solid #e0e0e0;
`;

const ToolsTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ToolsWrapper = styled.div`
  display: flex;
  gap: 15px;
`;

interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  toolType: ToolType;
}

const ToolButton = styled.button<ToolButtonProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active 
    ? toolInfo[props.toolType].activeColor 
    : toolInfo[props.toolType].color};
  color: white;
  border: 3px solid ${props => props.active 
    ? toolInfo[props.toolType].activeColor 
    : 'transparent'};
  border-radius: 12px;
  padding: 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  min-width: 70px;
  min-height: 70px;
  transition: all 0.3s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  transform: ${props => props.active ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.active ? '0 5px 15px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    background-color: ${props => props.disabled 
      ? toolInfo[props.toolType].color 
      : props.active 
        ? toolInfo[props.toolType].activeColor 
        : toolInfo[props.toolType].hoverColor};
    transform: ${props => props.disabled ? 'scale(1)' : 'scale(1.05)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'scale(1)' : 'scale(0.98)'};
  }
`;

const ToolIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  
  /* ツールに応じたアニメーション - 簡素化 */
  &.icon-select {
    /* 選択ツールはアニメーションなし */
  }
  
  &.icon-move {
    /* 移動ツールは浮遊アニメーション */
  }
  
  &.icon-rotate {
    /* 回転ツールはアニメーションなし */
  }
  
  &.icon-scale {
    /* サイズツールはアニメーションなし */
  }
`;

const ToolLabel = styled.div`
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;