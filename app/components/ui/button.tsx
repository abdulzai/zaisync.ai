"use client";

import * as React from "react";

export type ButtonVariant = "default" | "outline";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", className, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses =
      variant === "outline"
        ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
        : "bg-black text-white hover:bg-neutral-800";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
