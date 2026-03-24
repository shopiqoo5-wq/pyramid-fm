import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text', 
  width, 
  height, 
  style 
}) => {
  const baseStyle: React.CSSProperties = {
    width: width,
    height: height,
    ...style
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={baseStyle}
    />
  );
};
