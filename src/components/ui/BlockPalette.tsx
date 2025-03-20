import { useState } from 'react';
import styled from 'styled-components';
import { BlockType } from '../../types';

interface BlockPaletteProps {
  onDragStart: (type: BlockType, color: string) => void;
}

// ブロックのカテゴリータイプ
type BlockCategory = '基本' | '装飾' | '特殊';

// ブロック情報の型定義
interface BlockInfo {
  type: BlockType;
  label: string;
  category: BlockCategory;
  icon: string; // 絵文字アイコン
}

const PaletteContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
`;

const PaletteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const PaletteTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 12px;
`;

interface TabProps {
  isActive: boolean;
}

const CategoryTab = styled.button<TabProps>`
  padding: 8px 12px;
  background: ${props => props.isActive ? '#eaf6ff' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#1e88e5' : 'transparent'};
  color: ${props => props.isActive ? '#1e88e5' : '#666'};
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? '#eaf6ff' : '#f5f5f5'};
  }
`;

const BlocksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 15px;
`;

const BlockItem = styled.div`
  min-width: 70px;
  height: 70px;
  border-radius: 6px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const BlockIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const BlockLabel = styled.div`
  font-size: 12px;
  text-align: center;
  color: #333;
`;

const ColorPickerSection = styled.div`
  margin-top: 8px;
`;

const ColorPickerTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const ColorDot = styled.div<{ bgColor: string; isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  border: 2px solid ${props => props.isSelected ? '#000' : 'transparent'};
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.15);
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
  '#795548', // 茶色
  '#9e9e9e', // グレー
  '#607d8b', // 青グレー
  '#ffffff', // 白
];

// 利用可能なブロックの種類とそのアイコン/表示名/カテゴリー
const blockTypesInfo: BlockInfo[] = [
  { type: 'cube', label: '立方体', category: '基本', icon: '📦' },
  { type: 'rectangle', label: '直方体', category: '基本', icon: '🧱' },
  { type: 'cylinder', label: '円柱', category: '基本', icon: '🧪' },
  { type: 'triangle', label: '三角形', category: '基本', icon: '🔺' },
  { type: 'arch', label: 'アーチ', category: '装飾', icon: '🌉' },
  { type: 'wheel', label: '車輪', category: '特殊', icon: '🛞' },
  { type: 'window', label: '窓', category: '装飾', icon: '🪟' },
  { type: 'door', label: 'ドア', category: '装飾', icon: '🚪' },
];

export const BlockPalette = ({ onDragStart }: BlockPaletteProps) => {
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [activeCategory, setActiveCategory] = useState<BlockCategory>('基本');
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  // 選択されたカテゴリーのブロックをフィルタリング
  const filteredBlocks = blockTypesInfo.filter(block => block.category === activeCategory);

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

  // パレットを折りたたむトグル
  const togglePalette = () => {
    setIsPaletteCollapsed(!isPaletteCollapsed);
  };

  // 利用可能なカテゴリーの配列（重複を排除）
  const availableCategories = Array.from(new Set(blockTypesInfo.map(block => block.category)));

  if (isPaletteCollapsed) {
    return (
      <PaletteContainer style={{ width: 'auto', padding: '8px' }}>
        <ToggleButton onClick={togglePalette} title="パレットを展開">🧩</ToggleButton>
      </PaletteContainer>
    );
  }

  return (
    <PaletteContainer>
      <PaletteHeader>
        <PaletteTitle>ブロックパレット</PaletteTitle>
        <ToggleButton onClick={togglePalette} title="パレットを折りたたむ">
          ⬅️
        </ToggleButton>
      </PaletteHeader>
      
      <CategoryTabs>
        {availableCategories.map(category => (
          <CategoryTab
            key={category}
            isActive={category === activeCategory}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      <BlocksGrid>
        {filteredBlocks.map((block) => (
          <BlockItem
            key={block.type}
            style={{ backgroundColor: selectedColor }}
            draggable
            onDragStart={(e) => handleDragStart(e, block.type)}
            title={block.label}
          >
            <BlockIcon>{block.icon}</BlockIcon>
            <BlockLabel>{block.label}</BlockLabel>
          </BlockItem>
        ))}
      </BlocksGrid>
      
      <ColorPickerSection>
        <ColorPickerTitle>カラー</ColorPickerTitle>
        <ColorPicker>
          {colorPresets.map((color) => (
            <ColorDot
              key={color}
              bgColor={color}
              isSelected={color === selectedColor}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </ColorPicker>
      </ColorPickerSection>
    </PaletteContainer>
  );
}; 