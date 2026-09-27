import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFC Life Science | Japanese Wellness',
  description: 'Katalog resmi produk AFC Japan - SOP Subarashi, Utsukushii, Sensei Suru',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
