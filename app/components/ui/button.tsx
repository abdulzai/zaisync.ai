'use client';
import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline';
};

export function Button({ className = '', variant = 'solid', ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-xl text-sm transition';
  const solid = 'bg-[#3A8DFF] text-white hover:opacity-90';
  const outline = 'border border-[#E2E6EA] text-[#1C1E22] bg-white hover:bg-[#F9FAFB]';

  return (
    <button
      className={`${base} ${variant === 'outline' ? outline : solid} ${className}`}
      {...props}
    />
  );
}
