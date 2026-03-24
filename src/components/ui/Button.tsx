import React from 'react';
import './UI.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading,
  className = '',
  style,
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className} ${isLoading ? 'btn-loading' : ''}`}
      disabled={isLoading || props.disabled}
      style={style}
      {...props}
    >
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};
