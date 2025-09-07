'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'cashier';
}

export default function Sidebar({ role }: SidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear the auth store
        logout();
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear the local state and redirect
      logout();
      router.push('/login');
    }
  };

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Brands', href: '/admin/brands' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Reports', href: '/admin/reports' },
  ];

  const cashierMenuItems = [
    { name: 'Dashboard', href: '/cashier/dashboard' },
    { name: 'POS', href: '/cashier/pos' },
    { name: 'Orders', href: '/cashier/orders' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : cashierMenuItems;

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Inventory POS</h1>
        <p className="text-sm text-gray-400">{role === 'admin' ? 'Administrator' : 'Cashier'}</p>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3 px-4 hover:bg-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}