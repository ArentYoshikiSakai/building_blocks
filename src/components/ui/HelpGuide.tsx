import { useState } from 'react';
import styled from 'styled-components';

// ヘルプ項目の型定義
interface HelpItem {
  icon: string;
  text: string;
  color: string;
}

// ヘルプ項目データ
const helpItems: HelpItem[] = [
  { icon: '👆', text: 'パレットからブロックをドラッグして配置しよう', color: '#4dabf7' },
  { icon: '🛠️', text: 'ツールバーから使いたいツールを選ぼう', color: '#51cf66' },
  { icon: '🔍', text: 'ブロックをクリックして選択しよう', color: '#ff922b' },
  { icon: '🔄', text: '右クリック+ドラッグでブロックを回転させよう', color: '#9775fa' },
  { icon: '📏', text: 'Shiftキー+ドラッグでブロックの大きさを変えよう', color: '#cc5de8' },
  { icon: '🗑️', text: 'ブロックを選んでDeleteキーで削除しよう', color: '#ff6b6b' },
  { icon: '⚙️', text: '設定パネルで色やテクスチャを変えよう', color: '#868e96' },
];

export const HelpGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <HelpContainer>
      <HelpButton 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '❌ とじる' : '❓ ヘルプをみる'}
      </HelpButton>
      
      {isExpanded && (
        <HelpContent>
          <HelpTitle>あそびかた</HelpTitle>
          <HelpItemList>
            {helpItems.map((item, index) => (
              <HelpItemCard key={index} color={item.color}>
                <HelpItemIcon>{item.icon}</HelpItemIcon>
                <HelpItemText>{item.text}</HelpItemText>
              </HelpItemCard>
            ))}
          </HelpItemList>
        </HelpContent>
      )}
    </HelpContainer>
  );
};

const HelpContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 100px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const HelpButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  
  &:hover {
    background-color: #1976d2;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const HelpContent = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  margin-top: 15px;
  max-width: 400px;
  border: 3px solid #e0e0e0;
`;

const HelpTitle = styled.h3`
  margin-top: 0;
  color: #2196f3;
  font-size: 24px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const HelpItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HelpItemCard = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  background-color: ${props => props.color + '15'};
  border-left: 5px solid ${props => props.color};
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const HelpItemIcon = styled.div`
  font-size: 28px;
  margin-right: 15px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
`;

const HelpItemText = styled.div`
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
`; 