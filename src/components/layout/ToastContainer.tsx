import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import Toast from '../ui/Toast';

const ToastContainer: React.FC = () => {
  const { alerts } = useStore();

  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {alerts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
