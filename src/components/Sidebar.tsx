'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
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

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Brands', href: '/admin/brands' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Reports', href: '/admin/reports' },
  ];

  return (
    <div className="min-h-screen w-64 bg-gray-800 text-white">
      <div className="border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold">Inventory POS</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 transition-colors hover:bg-gray-700"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
