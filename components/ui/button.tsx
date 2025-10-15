import * as React from "react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "solid" }
>(function Button({ className = "", variant, ...props }, ref) {
  const base = "px-3 py-2 rounded-xl text-sm transition";
  const style =
    variant === "outline"
      ? "border border-[#E2E6EA] bg-white hover:bg-[#F5F7FB] text-[#1C1E22]"
      : "bg-[#3A8DFF] text-white hover:bg-[#2E78E8]";
  return <button ref={ref} className={`${base} ${style} ${className}`} {...props} />;
});
