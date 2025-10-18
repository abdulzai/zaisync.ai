import './globals.css';

export const metadata = {
  title: 'Aurora EA',
  description: 'enterprise-secure executive assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
