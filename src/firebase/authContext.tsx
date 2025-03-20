import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  getCurrentUser,
  onAuthChanged
} from './auth';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// デフォルト値
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {}
};

// 認証コンテキストの作成
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// 認証コンテキストを使用するためのフック
export const useAuth = () => useContext(AuthContext);

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // ログイン処理
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await loginUser(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Googleログイン処理
  const loginWithGoogleHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 登録処理
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ユーザー登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // エラークリア
  const clearError = () => {
    setError(null);
  };

  // コンテキスト値
  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    loginWithGoogle: loginWithGoogleHandler,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 