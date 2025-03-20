import React from 'react';
import Modal from './Modal';
import { ProjectList } from './ProjectList';
import { Project } from '../../models/Project';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onProjectSelect 
}) => {
  // プロジェクト選択時の処理
  const handleProjectSelect = (project: Project) => {
    onProjectSelect(project);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.projectModalContent}>
        <ProjectList 
          onProjectSelect={handleProjectSelect} 
          onClose={onClose}
        />
      </div>
    </Modal>
  );
}; 