import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'standard' | 'glass';
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, variant = 'standard' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${variant === 'glass' ? 'glass-surface shadow-glow' : 'ui-card'}`}
      style={{ 
        minHeight: '340px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '1rem',
        borderRadius: '32px',
        border: variant === 'glass' ? '1px solid var(--primary-border)' : '1px solid var(--border)'
      }}
    >
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          width: '80px', height: '80px', borderRadius: '24px', 
          background: 'var(--primary-light)', color: 'var(--primary)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.5rem', 
          boxShadow: '0 10px 25px -5px var(--primary-light)'
        }}
      >
        <Icon size={40} />
      </motion.div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600, maxWidth: '340px', lineHeight: 1.6 }}>{description}</p>
      </div>

      {action && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '1rem' }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
