import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '',
  style
}) => {
  return (
    <span 
      className={`status-badge ${variant} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};
