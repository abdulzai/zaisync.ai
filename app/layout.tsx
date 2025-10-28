import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Aurora EA',
  description: 'enterprise-secure executive assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
