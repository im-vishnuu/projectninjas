import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20';
  
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10',
    secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5',
    outline: 'border border-white/20 text-white hover:bg-white/5 hover:border-white/40 hover:scale-[1.02]'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    base: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};