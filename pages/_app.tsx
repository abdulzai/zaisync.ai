import type { AppProps } from 'next/app';
import '../app/globals.css'; // reuse your existing CSS
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
