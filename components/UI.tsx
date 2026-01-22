
import React from 'react';
import { OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';

export const BarriBoxLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' };
  return (
    <div className={`${sizes[size]} bg-[#160d2d] rounded-3xl shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center relative overflow-hidden border-2 border-[#2d1b54] ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-[#ec4899] animate-pulse"></div>
      <svg viewBox="0 0 24 24" className="w-2/3 h-2/3" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 7.5L12 3L3 7.5M21 7.5V16.5L12 21M21 7.5L12 12M12 21L3 16.5V7.5M12 21V12M3 7.5L12 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" fill="#ec4899" className="animate-pulse" />
      </svg>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-4 rounded-3xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg";
  const variants = {
    primary: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-purple-500/20",
    secondary: "bg-[#ec4899] text-white hover:bg-[#db2777] shadow-pink-500/20",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-[#2d1b54] text-purple-300 hover:bg-[#1a1433] bg-transparent",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-sm ${STATUS_COLORS[status]}`}>
    {status}
  </span>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; id?: string }> = ({ children, className = '', onClick, id }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`bg-[#160d2d]/90 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-[#2d1b54] transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-[#8b5cf6] hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] hover:-translate-y-1' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, type = "text", ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] font-bold uppercase tracking-widest text-purple-300/40 px-2">{label}</label>}
    <input 
      type={type}
      inputMode="text"
      autoComplete="off"
      className="bg-[#160d2d] border-2 border-[#2d1b54] rounded-2xl px-5 py-4 focus:border-[#8b5cf6] focus:outline-none transition-all text-white font-medium placeholder-purple-300/20"
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] font-bold uppercase tracking-widest text-purple-300/40 px-2">{label}</label>}
    <div className="relative">
      <select 
        className="w-full bg-[#160d2d] border-2 border-[#2d1b54] rounded-2xl px-5 py-4 focus:border-[#8b5cf6] focus:outline-none transition-all text-white font-bold appearance-none"
        {...props} 
      >
        {children}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b5cf6]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
);
