import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  lines = 1 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-800 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          } ${lines > 1 ? 'mb-2' : ''}`}
          style={{ height: '1rem' }}
        />
      ))}
    </div>
  );
};