import { useState } from 'react';
import styled from 'styled-components';
import { BlockType } from '../../types';

interface BlockPaletteProps {
  onDragStart: (type: BlockType, color: string) => void;
}

const PaletteContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

const BlockItem = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
`;

const ColorDot = styled.div<{ bgColor: string; isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  border: 2px solid ${props => props.isSelected ? '#000' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;

// 利用可能な色のプリセット
const colorPresets = [
  '#f44336', // 赤
  '#e91e63', // ピンク
  '#9c27b0', // 紫
  '#673ab7', // 深紫
  '#3f51b5', // インディゴ
  '#2196f3', // 青
  '#03a9f4', // ライトブルー
  '#00bcd4', // シアン
  '#009688', // ティール
  '#4caf50', // 緑
  '#8bc34a', // ライトグリーン
  '#cddc39', // ライム
  '#ffeb3b', // 黄色
  '#ffc107', // アンバー
  '#ff9800', // オレンジ
  '#ff5722', // ディープオレンジ
];

export const BlockPalette = ({ onDragStart }: BlockPaletteProps) => {
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);

  // 利用可能なブロックの種類とそのアイコン/表示名
  const blockTypes: { type: BlockType; label: string }[] = [
    { type: 'cube', label: '立方体' },
    { type: 'rectangle', label: '直方体' },
    { type: 'cylinder', label: '円柱' },
    { type: 'triangle', label: '三角形' },
    { type: 'arch', label: 'アーチ' },
    { type: 'wheel', label: '車輪' },
    { type: 'window', label: '窓' },
    { type: 'door', label: 'ドア' },
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.setData('blockColor', selectedColor);
    e.dataTransfer.effectAllowed = 'copy';
    
    // カスタムデータ転送のためのゴースト画像
    const ghostElement = document.createElement('div');
    ghostElement.style.width = '60px';
    ghostElement.style.height = '60px';
    ghostElement.style.backgroundColor = selectedColor;
    ghostElement.style.borderRadius = '4px';
    ghostElement.style.opacity = '0.8';
    document.body.appendChild(ghostElement);
    
    e.dataTransfer.setDragImage(ghostElement, 30, 30);
    
    // コールバックを実行
    onDragStart(type, selectedColor);
    
    // クリーンアップ関数（ドラッグ終了後にゴースト要素を削除）
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  return (
    <PaletteContainer>
      <h3>ブロック</h3>
      {blockTypes.map((block) => (
        <BlockItem
          key={block.type}
          style={{ backgroundColor: selectedColor }}
          draggable
          onDragStart={(e) => handleDragStart(e, block.type)}
        >
          {block.label}
        </BlockItem>
      ))}
      
      <h3>カラー</h3>
      <ColorPicker>
        {colorPresets.map((color) => (
          <ColorDot
            key={color}
            bgColor={color}
            isSelected={color === selectedColor}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </ColorPicker>
    </PaletteContainer>
  );
}; 