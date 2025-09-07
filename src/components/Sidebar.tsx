'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiHome,
  FiPackage,
  FiList,
  FiAward,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsSidebarCollapsed(JSON.parse(savedCollapsedState));
    }

    // Initialize open menus based on current path
    const initialOpenMenus: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (
        item.subItems &&
        item.subItems.some((subItem) => pathname?.startsWith(subItem.href))
      ) {
        initialOpenMenus[item.name] = true;
      }
    });
    setOpenMenus(initialOpenMenus);
  }, [pathname]);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      'sidebarCollapsed',
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Define menu items with icons and sub-items
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: FiHome,
      subItems: [],
    },
    {
      name: 'Products',
      href: '/products',
      icon: FiPackage,
      subItems: [
        { name: 'All Products', href: '/products' },
        { name: 'Add Product', href: '/products/new' },
      ],
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FiList,
      subItems: [],
    },
    {
      name: 'Brands',
      href: '/brands',
      icon: FiAward,
      subItems: [],
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: FiShoppingCart,
      subItems: [
        { name: 'All Orders', href: '/orders' },
        { name: 'Create Order', href: '/orders/new' },
      ],
    },
    {
      name: 'Users',
      href: '/users',
      icon: FiUsers,
      subItems: [],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FiBarChart2,
      subItems: [
        { name: 'Sales Report', href: '/reports/sales' },
        { name: 'Inventory Report', href: '/reports/inventory' },
      ],
    },
  ];

  // Get the appropriate menu item based on user role
  const getFilteredMenuItems = () => {
    if (user?.role === 'admin') {
      return menuItems;
    } else if (user?.role === 'cashier') {
      // Filter out admin-only items for cashier
      return menuItems.filter(
        (item) => item.name !== 'Users' && item.name !== 'Reports'
      );
    }
    return [];
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <div
      className={`min-h-screen bg-gray-800 text-white transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        {!isSidebarCollapsed && (
          <h1 className="text-xl font-bold">Inventory POS</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 transition-colors hover:bg-gray-700"
          aria-label={
            isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
        >
          {isSidebarCollapsed ? (
            <FiChevronRight size={20} />
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative mt-4 h-[calc(100vh-80px)] overflow-y-auto">
        <ul>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));
            const isMenuOpen = openMenus[item.name];

            return (
              <li key={item.name}>
                {/* Main menu item */}
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 transition-colors hover:bg-gray-700 ${
                    isActive ? 'border-l-4 border-indigo-500 bg-gray-900' : ''
                  }`}
                  onClick={(e) => {
                    if (item.subItems && item.subItems.length > 0) {
                      e.preventDefault();
                      toggleMenu(item.name);
                    }
                  }}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="ml-3">{item.name}</span>
                      {item.subItems && item.subItems.length > 0 && (
                        <span className="ml-auto">
                          {isMenuOpen ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Sub-menu items */}
                {!isSidebarCollapsed &&
                  item.subItems &&
                  item.subItems.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <ul className="py-2 pl-12">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.name} className="mb-1">
                              <Link
                                href={subItem.href}
                                className={`block rounded-md px-4 py-2 transition-colors ${
                                  isSubActive
                                    ? 'bg-gray-900 text-indigo-300'
                                    : 'hover:bg-gray-700'
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
              </li>
            );
          })}
        </ul>

        {/* Logout button */}
        <div
          className={`absolute bottom-0 w-full border-t border-gray-700 p-4 ${isSidebarCollapsed ? 'text-center' : ''}`}
        >
          <button
            onClick={handleLogout}
            className={`flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 transition-colors hover:bg-red-700 ${
              isSidebarCollapsed ? 'px-2 py-3' : ''
            }`}
          >
            <FiLogOut size={20} />
            {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}
