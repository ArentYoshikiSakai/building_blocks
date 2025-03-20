import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Euler, Vector3 } from 'three';

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onRotate: (axis: 'x' | 'y' | 'z', direction: 1 | -1) => void;
}

const MenuContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 8px 0;
  z-index: 1000;
  min-width: 150px;
`;

const MenuTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  padding: 4px 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  margin-bottom: 4px;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SubMenuContainer = styled.div`
  margin: 4px 0;
`;

const SubMenuTitle = styled.div`
  font-size: 12px;
  color: #666;
  padding: 4px 16px;
`;

const RotationIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

export const ContextMenu = ({ position, onClose, onRotate }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // メニュー外のクリックを検出してメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // X軸回転
  const handleRotateX = (direction: 1 | -1) => {
    onRotate('x', direction);
    onClose();
  };
  
  // Y軸回転
  const handleRotateY = (direction: 1 | -1) => {
    onRotate('y', direction);
    onClose();
  };
  
  // Z軸回転
  const handleRotateZ = (direction: 1 | -1) => {
    onRotate('z', direction);
    onClose();
  };
  
  return (
    <MenuContainer ref={menuRef} x={position.x} y={position.y}>
      <MenuTitle>ブロック操作</MenuTitle>
      
      <SubMenuContainer>
        <SubMenuTitle>X軸回転</SubMenuTitle>
        <MenuItem onClick={() => handleRotateX(1)}>
          <RotationIcon>🔄</RotationIcon> 右に90度
        </MenuItem>
        <MenuItem onClick={() => handleRotateX(-1)}>
          <RotationIcon>🔄</RotationIcon> 左に90度
        </MenuItem>
      </SubMenuContainer>
      
      <SubMenuContainer>
        <SubMenuTitle>Y軸回転</SubMenuTitle>
        <MenuItem onClick={() => handleRotateY(1)}>
          <RotationIcon>🔄</RotationIcon> 右に90度
        </MenuItem>
        <MenuItem onClick={() => handleRotateY(-1)}>
          <RotationIcon>🔄</RotationIcon> 左に90度
        </MenuItem>
      </SubMenuContainer>
      
      <SubMenuContainer>
        <SubMenuTitle>Z軸回転</SubMenuTitle>
        <MenuItem onClick={() => handleRotateZ(1)}>
          <RotationIcon>🔄</RotationIcon> 右に90度
        </MenuItem>
        <MenuItem onClick={() => handleRotateZ(-1)}>
          <RotationIcon>🔄</RotationIcon> 左に90度
        </MenuItem>
      </SubMenuContainer>
    </MenuContainer>
  );
}; 