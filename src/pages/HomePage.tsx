import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorScene } from '../scenes/EditorScene';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // 管理者ログイン画面へ遷移
  const handleAuthClick = () => {
    if (user) {
      // ログアウト確認
      if (window.confirm('ログアウトしますか？')) {
        logout();
      }
    } else {
      navigate('/admin/login');
    }
  };
  
  // プロジェクト管理画面へ遷移
  const handleProjectClick = () => {
    // プロジェクト管理画面へ遷移するロジック
    console.log('プロジェクト管理画面へ遷移');
  };
  
  // 共有機能
  const handleShareClick = () => {
    // 共有機能のロジック
    console.log('共有機能');
  };
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <EditorScene 
        onAuthClick={handleAuthClick} 
        onProjectClick={handleProjectClick}
        onShareClick={handleShareClick}
      />
    </div>
  );
}; 