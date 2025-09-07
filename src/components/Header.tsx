'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsedState) {
        setIsSidebarCollapsed(JSON.parse(savedCollapsedState));
      }
    };

    // Check initial state
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Dashboard
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-800 font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}