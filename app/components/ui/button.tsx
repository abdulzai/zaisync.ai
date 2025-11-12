'use client';
import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: false;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ' +
          'bg-black text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none ' +
          className
        }
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
