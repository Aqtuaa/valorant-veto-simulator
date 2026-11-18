import React from 'react';
import { playHoverSound, playTacticalClick } from '../../utils/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cyan' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  onClick,
  onMouseEnter,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    playTacticalClick();
    if (onClick) onClick(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) playHoverSound();
    if (onMouseEnter) onMouseEnter(e);
  };

  const variantStyles = {
    primary:
      'bg-val-red hover:bg-val-red-hover text-val-white border-b-2 border-red-700 shadow-val-red active:translate-y-0.5',
    secondary:
      'bg-val-surface hover:bg-val-surface-card text-val-white border border-val-border hover:border-val-border-light active:translate-y-0.5',
    cyan:
      'bg-val-cyan hover:bg-val-cyan-dark text-val-black font-bold border-b-2 border-teal-600 shadow-val-cyan active:translate-y-0.5',
    gold:
      'bg-val-gold hover:bg-amber-400 text-val-black font-bold border-b-2 border-amber-600 shadow-val-gold active:translate-y-0.5',
    danger:
      'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 active:translate-y-0.5',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs tracking-wider uppercase font-semibold',
    md: 'px-5 py-2.5 text-sm tracking-wider uppercase font-bold',
    lg: 'px-8 py-3.5 text-base tracking-widest uppercase font-extrabold',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`relative inline-flex items-center justify-center gap-2 clip-val-button transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
