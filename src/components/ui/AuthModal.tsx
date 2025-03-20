import React, { useState } from 'react';
import Modal from './Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.authModalContent}>
        {isLoginView ? (
          <LoginForm 
            onSuccess={handleSuccess} 
            onRegisterClick={() => setIsLoginView(false)}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleSuccess}
            onLoginClick={() => setIsLoginView(true)}
          />
        )}
      </div>
    </Modal>
  );
}; 