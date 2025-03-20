import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useBlockStore } from '../../store/useBlockStore';
import { ProjectSettings } from '../../types';

const SettingsPanelContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
`;

const SettingsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
`;

const SettingsGroup = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SettingsGroupTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 10px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: #2196F3;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const SettingsLabel = styled.label`
  flex: 1;
  font-size: 14px;
`;

const SettingsSlider = styled.input`
  width: 100%;
  margin: 10px 0;
`;

const SliderValue = styled.div`
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: -5px;
`;

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  margin-left: 10px;
  cursor: pointer;
`;

const ColorInput = styled.input`
  width: 100%;
  margin-top: 5px;
`;

const TextureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const TextureOption = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? '#2196F3' : 'transparent'};
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const TextureColorSwatch = styled.div<{ color: string }>`
  width: 100%;
  height: 60px;
  background-color: ${props => props.color};
`;

const TextureName = styled.div`
  font-size: 12px;
  text-align: center;
  padding: 4px 0;
  background-color: rgba(0, 0, 0, 0.05);
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  
  input {
    margin-right: 8px;
  }
`;

// テクスチャに対応する色とラベル
const textureInfo = {
  grass: { name: '草原', color: '#7cba3f' },
  sand: { name: '砂地', color: '#e6d59e' },
  stone: { name: '石畳', color: '#a7a7a7' },
  wood: { name: '木製', color: '#8b5a2b' },
};

// テクスチャオプション - Object.entriesで配列に変換
const textureOptions = Object.entries(textureInfo).map(([id, info]) => ({
  id,
  name: info.name,
  color: info.color
}));

// 照明モードオプション
const lightingOptions = [
  { id: 'day', name: '昼間' },
  { id: 'night', name: '夜間' },
  { id: 'custom', name: 'カスタム' },
];

export const SettingsPanel = () => {
  const { activeProject, updateProjectSettings } = useBlockStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!activeProject) return null;

  const { 
    gridEnabled, 
    gridSize, 
    snapToGrid, 
    backgroundColor, 
    groundTexture, 
    lightingMode 
  } = activeProject.settings;

  // 各設定の更新ハンドラ
  const handleToggleGrid = () => {
    updateProjectSettings({ gridEnabled: !gridEnabled });
  };

  const handleToggleSnap = () => {
    updateProjectSettings({ snapToGrid: !snapToGrid });
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseFloat(e.target.value);
    updateProjectSettings({ gridSize: size });
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectSettings({ backgroundColor: e.target.value });
  };

  const handleTextureChange = useCallback((textureId: string) => {
    updateProjectSettings({ groundTexture: textureId });
  }, [updateProjectSettings]);

  const handleLightingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectSettings({ lightingMode: e.target.value as 'day' | 'night' | 'custom' });
  }, [updateProjectSettings]);

  return (
    <SettingsPanelContainer>
      <SettingsTitle>プロジェクト設定</SettingsTitle>
      
      {/* 背景色設定 */}
      <SettingsGroup>
        <SettingsGroupTitle>背景設定</SettingsGroupTitle>
        
        <SettingsRow>
          <SettingsLabel>背景色</SettingsLabel>
          <ColorPreview 
            color={backgroundColor} 
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
        </SettingsRow>
        
        {showColorPicker && (
          <ColorInput 
            type="color" 
            value={backgroundColor} 
            onChange={handleBackgroundColorChange}
          />
        )}
      </SettingsGroup>
      
      {/* 地面テクスチャ設定 */}
      <SettingsGroup>
        <SettingsGroupTitle>地面テクスチャ</SettingsGroupTitle>
        
        <TextureGrid>
          {textureOptions.map(texture => (
            <TextureOption 
              key={texture.id}
              selected={groundTexture === texture.id}
              onClick={() => handleTextureChange(texture.id)}
            >
              <TextureColorSwatch color={texture.color} />
              <TextureName>{texture.name}</TextureName>
            </TextureOption>
          ))}
        </TextureGrid>
      </SettingsGroup>
      
      {/* 照明設定 */}
      <SettingsGroup>
        <SettingsGroupTitle>照明設定</SettingsGroupTitle>
        
        <RadioGroup>
          {lightingOptions.map(option => (
            <RadioOption key={option.id}>
              <input 
                type="radio" 
                name="lighting" 
                value={option.id} 
                checked={lightingMode === option.id}
                onChange={handleLightingChange}
              />
              {option.name}
            </RadioOption>
          ))}
        </RadioGroup>
      </SettingsGroup>
      
      {/* グリッド設定 */}
      <SettingsGroup>
        <SettingsGroupTitle>グリッド設定</SettingsGroupTitle>
        
        <SettingsRow>
          <SettingsLabel>グリッド表示</SettingsLabel>
          <ToggleSwitch>
            <input 
              type="checkbox" 
              checked={gridEnabled} 
              onChange={handleToggleGrid} 
            />
            <span></span>
          </ToggleSwitch>
        </SettingsRow>

        <SettingsRow>
          <SettingsLabel>グリッドスナップ</SettingsLabel>
          <ToggleSwitch>
            <input 
              type="checkbox" 
              checked={snapToGrid} 
              onChange={handleToggleSnap} 
            />
            <span></span>
          </ToggleSwitch>
        </SettingsRow>

        <SettingsLabel>グリッドサイズ</SettingsLabel>
        <SettingsSlider
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={gridSize}
          onChange={handleGridSizeChange}
        />
        <SliderValue>{gridSize}</SliderValue>
      </SettingsGroup>
    </SettingsPanelContainer>
  );
}; 