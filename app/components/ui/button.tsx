// app/components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

type Variant = 'solid' | 'outline';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
};

export function Button({
  asChild,
  variant = 'solid',
  className = '',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const base =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded transition-colors';
  const styles =
    variant === 'outline'
      ? 'border bg-transparent hover:bg-gray-50'
      : 'bg-black text-white hover:bg-black/90';

  return <Comp className={`${base} ${styles} ${className}`} {...props} />;
}

export default Button;
