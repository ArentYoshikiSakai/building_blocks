import { useState } from 'react';
import styled from 'styled-components';
import { BlockType } from '../../types';
import styles from './BlockPalette.module.css';

interface BlockPaletteProps {
  onDragStart: (type: BlockType, color: string) => void;
}

// ブロックのカテゴリータイプ
type BlockCategory = '基本' | '装飾' | '特殊';

// カテゴリーカラーマップ
const categoryColors = {
  '基本': {
    bg: '#e3fafc',
    border: '#15aabf',
    active: '#c5f6fa'
  },
  '装飾': {
    bg: '#fff3bf',
    border: '#fab005',
    active: '#ffec99'
  },
  '特殊': {
    bg: '#f3f0ff',
    border: '#7950f2',
    active: '#e5dbff'
  }
};

// ブロック情報の型定義
interface BlockInfo {
  type: BlockType;
  label: string;
  category: BlockCategory;
  icon: string; // 絵文字アイコン
}

const PaletteContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
  border: 3px solid #e0e0e0;
`;

const PaletteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PaletteTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  color: #555;
  transition: all 0.2s;
  border-radius: 50%;
  
  &:hover {
    color: #000;
    background-color: #f0f0f0;
    transform: scale(1.1);
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
  justify-content: center;
`;

interface TabProps {
  isActive: boolean;
  category: BlockCategory;
}

const CategoryTab = styled.button<TabProps>`
  padding: 10px 18px;
  background: ${props => props.isActive ? categoryColors[props.category].active : categoryColors[props.category].bg};
  border: 3px solid ${props => props.isActive ? categoryColors[props.category].border : 'transparent'};
  border-radius: 12px;
  color: #333;
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: ${props => props.isActive ? '0 4px 8px rgba(0, 0, 0, 0.15)' : 'none'};
  transform: ${props => props.isActive ? 'translateY(-2px)' : 'none'};
  
  &:hover {
    background-color: ${props => categoryColors[props.category].active};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BlocksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const BlockItem = styled.div`
  min-width: 85px;
  height: 85px;
  border-radius: 12px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: all 0.3s;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    z-index: 1;
    border-color: rgba(0, 0, 0, 0.2);
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const BlockIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
`;

const BlockLabel = styled.div`
  font-size: 14px;
  text-align: center;
  color: #333;
  font-weight: bold;
`;

const ColorPickerSection = styled.div`
  margin-top: 12px;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
`;

const ColorPickerTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  text-align: center;
  font-weight: bold;
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

const ColorDot = styled.div<{ bgColor: string; isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  border: 3px solid ${props => props.isSelected ? '#000' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: ${props => props.isSelected ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
`;

// プリセットカラーパレット
const presetColors = [
  '#f44336', // 赤
  '#e91e63', // ピンク
  '#9c27b0', // 紫
  '#673ab7', // ディープパープル
  '#3f51b5', // インディゴ
  '#2196f3', // ブルー
  '#03a9f4', // ライトブルー
  '#00bcd4', // シアン
  '#009688', // ティール
  '#4caf50', // グリーン
  '#8bc34a', // ライトグリーン
  '#cddc39', // ライム
  '#ffeb3b', // イエロー
  '#ffc107', // アンバー
  '#ff9800', // オレンジ
  '#ff5722', // ディープオレンジ
  '#795548', // ブラウン
  '#9e9e9e', // グレー
  '#607d8b', // ブルーグレー
  '#ffffff', // ホワイト
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
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);
  const [activeCategory, setActiveCategory] = useState<BlockCategory>('基本');
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 選択されたカテゴリーのブロックをフィルタリング
  const filteredBlocks = blockTypesInfo.filter(block => block.category === activeCategory);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.setData('blockColor', selectedColor);
    e.dataTransfer.effectAllowed = 'copy';
    
    // カスタムデータ転送のためのゴースト画像
    const ghostElement = document.createElement('div');
    ghostElement.style.width = '70px';
    ghostElement.style.height = '70px';
    ghostElement.style.backgroundColor = selectedColor;
    ghostElement.style.borderRadius = '8px';
    ghostElement.style.opacity = '0.8';
    ghostElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(ghostElement);
    
    e.dataTransfer.setDragImage(ghostElement, 35, 35);
    
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

  // カラーピッカーの表示/非表示を切り替え
  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };
  
  // 色の選択
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  if (isPaletteCollapsed) {
    return (
      <PaletteContainer style={{ width: 'auto', padding: '12px' }}>
        <ToggleButton onClick={togglePalette} title="パレットを展開">
          <span style={{ fontSize: '24px' }}>🧩</span>
        </ToggleButton>
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
            isActive={activeCategory === category}
            category={category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      <BlocksGrid>
        {filteredBlocks.map(block => (
          <BlockItem 
            key={block.type}
            draggable
            onDragStart={(e) => handleDragStart(e, block.type)}
            style={{ backgroundColor: selectedColor + '20' }} // 薄い背景色
          >
            <BlockIcon>{block.icon}</BlockIcon>
            <BlockLabel>{block.label}</BlockLabel>
          </BlockItem>
        ))}
      </BlocksGrid>
      
      <ColorPickerSection>
        <ColorPickerTitle>ブロックの色</ColorPickerTitle>
        <div className={styles.colorPickerSection}>
          <div 
            className={styles.selectedColor} 
            style={{ backgroundColor: selectedColor }}
            onClick={toggleColorPicker}
          />
          <button 
            className={styles.colorPickerButton}
            onClick={toggleColorPicker}
          >
            色を選択
          </button>
          
          {showColorPicker && (
            <div className={styles.colorPickerPopup}>
              <div className={styles.colorGrid}>
                {presetColors.map((color) => (
                  <div
                    key={color}
                    className={styles.colorOption}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ColorPickerSection>
    </PaletteContainer>
  );
}; 