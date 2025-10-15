import * as React from "react";

export function Card({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`bg-white ${className}`}>{children}</div>;
}

export function CardContent({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}
