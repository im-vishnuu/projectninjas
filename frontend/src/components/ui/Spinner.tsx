import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'base', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    base: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};