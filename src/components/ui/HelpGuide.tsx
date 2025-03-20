import { useState } from 'react';
import styled from 'styled-components';

export const HelpGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <HelpContainer>
      <HelpButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '❌ 閉じる' : '❓ ヘルプ'}
      </HelpButton>
      
      {isExpanded && (
        <HelpContent>
          <h3>Block World 操作方法</h3>
          <ul>
            <li>👆 パレットからブロックをドラッグして配置</li>
            <li>🛠️ ツールバーから適切なツールを選択</li>
            <li>🔍 ブロックを選択してドラッグで移動</li>
            <li>🔄 選択したブロックを右クリック+ドラッグして回転</li>
            <li>📏 Shiftキー+ドラッグでブロックサイズ変更</li>
            <li>🗑️ ブロックを選択して「Delete」キーで削除</li>
            <li>🗑️ 削除ツールを選択してブロックをクリックで削除</li>
            <li>⚙️ 設定パネルでプロジェクト全体の設定を調整</li>
          </ul>
        </HelpContent>
      )}
    </HelpContainer>
  );
};

const HelpContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 80px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const HelpButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &:hover {
    background-color: #1976d2;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const HelpContent = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  padding: 16px;
  margin-top: 10px;
  max-width: 350px;
  
  h3 {
    margin-top: 0;
    color: #2196f3;
    font-size: 18px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
`; 