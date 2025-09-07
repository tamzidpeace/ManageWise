import type { Metadata } from 'next';
import './globals.css';
import LayoutItems from './LayoutItems';

export const metadata: Metadata = {
  title: 'Inventory POS System',
  description: 'Inventory and Sales Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LayoutItems children={children} />
      </body>
    </html>
  );
}
