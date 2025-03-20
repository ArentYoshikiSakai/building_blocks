import React, { useState } from 'react';
import { useAuth } from '../../firebase/authContext';
import styles from './AuthForms.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    
    if (onSuccess && !error) {
      onSuccess();
    }
  };
  
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    
    if (onSuccess && !error) {
      onSuccess();
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <h2 className={styles.formTitle}>ログイン</h2>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button className={styles.errorCloseButton} onClick={clearError}>×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="example@example.com"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="パスワード"
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      
      <div className={styles.separator}>または</div>
      
      <button 
        onClick={handleGoogleLogin} 
        className={styles.googleButton}
        disabled={loading}
      >
        <span className={styles.googleIcon}>G</span>
        Googleでログイン
      </button>
      
      <div className={styles.switchFormText}>
        アカウントをお持ちでない場合は
        <button 
          onClick={onRegisterClick} 
          className={styles.switchFormButton}
          disabled={loading}
        >
          新規登録
        </button>
      </div>
    </div>
  );
}; 