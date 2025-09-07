'use client';

export default function CashierDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Today's Sales</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">$1,245</p>
        <p className="text-sm text-gray-500 mt-1">12 orders</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Pending Orders</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">3</p>
        <p className="text-sm text-gray-500 mt-1">Needs attention</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">8</p>
        <p className="text-sm text-gray-500 mt-1">Needs restocking</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition-colors">
            New Sale
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors">
            Process Order
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-md transition-colors">
            View Reports
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#TXN-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10:30 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$89.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cash</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#TXN-002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">11:15 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5 items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$145.50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Card</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#TXN-003</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12:45 PM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2 items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$67.25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cash</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}