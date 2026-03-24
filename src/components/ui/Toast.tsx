import React from 'react';
import { motion } from 'framer-motion';
import { 
  LuBadgeCheck, 
  LuShieldAlert, 
  LuInfo, 
  LuTriangle,
  LuX
} from 'react-icons/lu';
import type { Toast as ToastType } from '../../types';
import { useStore } from '../../store';

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { dismissAlert } = useStore();

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <LuBadgeCheck size={18} />;
      case 'error': return <LuShieldAlert size={18} />;
      case 'warning': return <LuTriangle size={18} />;
      default: return <LuInfo size={18} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`toast toast-${toast.type}`}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        {toast.message}
      </div>
      <button 
        className="toast-close" 
        onClick={() => dismissAlert(toast.id)}
      >
        <LuX size={16} />
      </button>
      
      {/* Progress bar for auto-dismiss - subtle visual cue */}
      <motion.div
        className="toast-progress"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};

export default Toast;
