'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import React from 'react';

export default function LayoutItems({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <div>{children}</div>;
  }

  return (
    <div>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 bg-gray-50 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
