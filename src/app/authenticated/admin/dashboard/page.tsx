'use client';

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">142</p>
        <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">248</p>
        <p className="text-sm text-gray-500 mt-1">+8% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">$24,560</p>
        <p className="text-sm text-gray-500 mt-1">+15% from last month</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 5, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$245.00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jane Smith</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 4, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$189.50</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-003</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Robert Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 3, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$320.75</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}