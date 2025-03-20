import { useState } from 'react';
import styled from 'styled-components';
import { useBlockStore } from '../../store/useBlockStore';

export type ToolType = 'select' | 'move' | 'rotate' | 'scale' | 'delete';

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
        <ToolButton 
          active={activeTool === 'select'} 
          onClick={() => handleToolClick('select')}
          title="選択ツール"
        >
          <ToolIcon>👆</ToolIcon>
          <ToolLabel>選択</ToolLabel>
        </ToolButton>
        
        <ToolButton 
          active={activeTool === 'move'} 
          onClick={() => handleToolClick('move')}
          disabled={!selectedBlockId}
          title="移動ツール"
        >
          <ToolIcon>✋</ToolIcon>
          <ToolLabel>移動</ToolLabel>
        </ToolButton>
        
        <ToolButton 
          active={activeTool === 'rotate'} 
          onClick={() => handleToolClick('rotate')}
          disabled={!selectedBlockId}
          title="回転ツール"
        >
          <ToolIcon>🔄</ToolIcon>
          <ToolLabel>回転</ToolLabel>
        </ToolButton>
        
        <ToolButton 
          active={activeTool === 'scale'} 
          onClick={() => handleToolClick('scale')}
          disabled={!selectedBlockId}
          title="サイズ変更ツール"
        >
          <ToolIcon>📏</ToolIcon>
          <ToolLabel>サイズ</ToolLabel>
        </ToolButton>
        
        <ToolButton 
          color="red"
          onClick={() => handleToolClick('delete')}
          disabled={!selectedBlockId}
          title="削除ツール"
        >
          <ToolIcon>❌</ToolIcon>
          <ToolLabel>削除</ToolLabel>
        </ToolButton>
      </ToolsWrapper>
    </ToolBarContainer>
  );
};

const ToolBarContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
`;

const ToolsTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
`;

const ToolsWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

interface ToolButtonProps {
  active?: boolean;
  color?: string;
  disabled?: boolean;
}

const ToolButton = styled.button<ToolButtonProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.active ? '#e6f7ff' : 'white'};
  color: ${props => props.color || (props.disabled ? '#999' : '#333')};
  border: 2px solid ${props => props.active ? '#1890ff' : '#ddd'};
  border-radius: 8px;
  padding: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  min-width: 60px;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? 'white' : props.active ? '#bae7ff' : '#f0f0f0'};
  }
`;

const ToolIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const ToolLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
`; 