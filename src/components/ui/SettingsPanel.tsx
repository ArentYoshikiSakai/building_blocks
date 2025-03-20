import { useState } from 'react';
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
`;

const SettingsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
`;

const SettingsGroup = styled.div`
  margin-bottom: 15px;
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

export const SettingsPanel = () => {
  const { activeProject, updateProjectSettings } = useBlockStore();

  if (!activeProject) return null;

  const { gridEnabled, gridSize, snapToGrid } = activeProject.settings;

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

  return (
    <SettingsPanelContainer>
      <SettingsTitle>設定</SettingsTitle>
      
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