import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register, loginWithGoogle, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  // ユーザーがログイン済みの場合はホームにリダイレクト
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, username);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>ブロックワールド 管理画面</h1>
          <h2 className={styles.subtitle}>{isLogin ? 'ログイン' : '新規登録'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="username">ユーザー名</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
              <button type="button" onClick={clearError} className={styles.clearError}>×</button>
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'ログイン' : '登録'}
          </button>

          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className={styles.googleButton}
          >
            Googleでログイン
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={styles.switchButton}
          >
            {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <button
            className={styles.backButton}
            onClick={() => navigate('/')}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}; 