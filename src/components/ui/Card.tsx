import React from 'react';
import './UI.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'premium' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  style, 
  title, 
  footer,
  onClick,
  variant = 'default'
}) => {
  const variantClass = variant === 'premium' ? 'card-premium' : 
                       variant === 'glass' ? 'glass-surface' : 'ui-card';
  
  return (
    <div 
      className={`${variantClass} ${className} ${onClick ? 'cursor-pointer' : ''}`} 
      style={style}
      onClick={onClick}
    >
      {title && (
        <div className="ui-card-header">
          <h3 className="ui-card-title">{title}</h3>
        </div>
      )}
      <div className="ui-card-body">
        {children}
      </div>
      {footer && (
        <div className="ui-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};
