// app/components/ui/card.tsx
import * as React from 'react';

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return (
    <div
      className={`rounded-2xl border border-gray-200 shadow-sm p-4 bg-white ${className}`}
      {...rest}
    />
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`mb-2 ${className}`} {...rest} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className = '', ...rest } = props;
  return <h3 className={`text-lg font-semibold ${className}`} {...rest} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`${className}`} {...rest} />;
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`mt-3 ${className}`} {...rest} />;
}
