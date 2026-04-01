import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import './UI.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  className = '', 
  style 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`ui-modal-overlay animate-fade-in ${className}`} onClick={onClose} style={style}>
      <div className="ui-modal-content" onClick={e => e.stopPropagation()}>
        <div className="ui-modal-header">
          <h2>{title}</h2>
          <button className="icon-btn-premium ui-modal-close" onClick={onClose} title="Close Modal">
            <LuX size={20} />
          </button>
        </div>
        <div className="ui-modal-body">
          {children}
        </div>
        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

