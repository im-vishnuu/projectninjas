import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div className={`
      bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm
      ${hover ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5 hover:border-gray-700 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};