import React, { useState } from 'react';
import { useAuth } from '../../firebase/authContext';
import styles from './AuthForms.module.css';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const { register, loginWithGoogle, loading, error, clearError } = useAuth();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setFormError('パスワードが一致しません');
      return false;
    }
    
    if (password.length < 6) {
      setFormError('パスワードは6文字以上である必要があります');
      return false;
    }
    
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await register(email, password);
    
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
      <h2 className={styles.formTitle}>新規登録</h2>
      
      {(error || formError) && (
        <div className={styles.errorMessage}>
          {error || formError}
          <button 
            className={styles.errorCloseButton} 
            onClick={() => {
              clearError();
              setFormError(null);
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="register-email" className={styles.label}>メールアドレス</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="example@example.com"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="register-password" className={styles.label}>パスワード</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="6文字以上のパスワード"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="register-confirm-password" className={styles.label}>パスワード（確認）</label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="パスワードを再入力"
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={loading}
        >
          {loading ? '登録中...' : 'アカウント作成'}
        </button>
      </form>
      
      <div className={styles.separator}>または</div>
      
      <button 
        onClick={handleGoogleLogin} 
        className={styles.googleButton}
        disabled={loading}
      >
        <span className={styles.googleIcon}>G</span>
        Googleで登録
      </button>
      
      <div className={styles.switchFormText}>
        すでにアカウントをお持ちの場合は
        <button 
          onClick={onLoginClick} 
          className={styles.switchFormButton}
          disabled={loading}
        >
          ログイン
        </button>
      </div>
    </div>
  );
}; 