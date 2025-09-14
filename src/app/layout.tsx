import type { Metadata } from 'next';
import './globals.css';
import LayoutItems from './LayoutItems';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

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
        <ToastProvider>
          <LayoutItems children={children} />
          <Toaster />
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
