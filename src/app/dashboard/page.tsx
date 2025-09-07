'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Don't render the dashboard if the user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 bg-gray-50 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Total Products
              </h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">142</p>
              <p className="mt-1 text-sm text-gray-500">+12% from last month</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Total Orders
              </h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">248</p>
              <p className="mt-1 text-sm text-gray-500">+8% from last month</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">$24,560</p>
              <p className="mt-1 text-sm text-gray-500">+15% from last month</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow md:col-span-2 lg:col-span-3">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Recent Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        #ORD-001
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        John Doe
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Sep 5, 2025
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        $245.00
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        #ORD-002
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Jane Smith
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Sep 4, 2025
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        $189.50
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        #ORD-003
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Robert Johnson
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Sep 3, 2025
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        $320.75
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
