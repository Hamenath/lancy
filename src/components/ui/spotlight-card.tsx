import React, { type ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const getSizeClasses = () => {
    if (customSize) {
      return '';
    }
    return sizeMap[size];
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
  };

  if (width !== undefined) {
    baseStyles.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    baseStyles.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      style={baseStyles}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-3/4' : ''}
        rounded-none 
        relative 
        grid 
        grid-rows-[1fr_auto] 
        p-4 
        gap-4 
        backdrop-blur-[5px]
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export { GlowCard };
