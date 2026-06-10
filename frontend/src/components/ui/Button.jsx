import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  shimmer = false,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-display font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/10 active:bg-amber-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 active:bg-emerald-800',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 active:bg-zinc-900',
    outline: 'bg-transparent border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white',
    ghost: 'bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;
  const shimmerClass = shimmer ? 'btn-shimmer' : '';

  return (
    <button 
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${shimmerClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
