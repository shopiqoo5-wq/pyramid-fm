import React from 'react';
import './UI.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="input-field" {...props} />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
