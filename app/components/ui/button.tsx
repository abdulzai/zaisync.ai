// app/components/ui/button.tsx
import * as React from 'react';

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const styles: Record<Variant, string> = {
    primary:
      'bg-[#3A80FF] text-white hover:bg-[#2f6be0] focus:ring-[#3A80FF] disabled:opacity-60',
    secondary:
      'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 disabled:opacity-60',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 disabled:opacity-60',
  };

  return <button className={cn(base, styles[variant], className)} {...props} />;
}
