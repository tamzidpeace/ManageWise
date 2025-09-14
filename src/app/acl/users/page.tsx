'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FiEdit, FiTrash2, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Role {
  _id: string;
  name: string;
  description: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState<{[key: string]: boolean}>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch users
    fetchUsers();
  }, [isAuthenticated, router]);

  const fetchUsers = useCallback(
    async (page: number = 1, search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`/api/users?${queryParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
          setPagination(data.pagination);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('An error occurred while fetching users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, token]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      fetchUsers(1, value);
    }, 500); // 500ms debounce delay
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the users list
        fetchUsers(pagination.page, searchTerm);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('An error occurred while deleting the user');
      console.error('Error deleting user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleActivateUser = async (user: User) => {
    try {
      // Set loading state for this user
      setActivating(prev => ({ ...prev, [user._id]: true }));
      
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the users list
        fetchUsers(pagination.page, searchTerm);
      } else {
        setError(data.message || 'Failed to activate user');
      }
    } catch (err) {
      setError('An error occurred while activating the user');
      console.error('Error activating user:', err);
    } finally {
      // Remove loading state for this user
      setActivating(prev => {
        const newState = { ...prev };
        delete newState[user._id];
        return newState;
      });
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      // Set loading state for this user
      setActivating(prev => ({ ...prev, [user._id]: true }));
      
      const response = await fetch(`/api/users/${user._id}`, {
        method: user.isActive ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the users list
        fetchUsers(pagination.page, searchTerm);
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('An error occurred while updating the user status');
      console.error('Error updating user status:', err);
    } finally {
      // Remove loading state for this user
      setActivating(prev => {
        const newState = { ...prev };
        delete newState[user._id];
        return newState;
      });
    }
  };

  // Don't render the page if the user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button onClick={() => router.push('/acl/users/create')} className="flex items-center gap-2">
          <FiUserPlus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {users.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No users found matching your search.'
                    : 'No users found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Roles
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Created At
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.roles.map(role => role.name).join(', ') || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Switch
                            aria-label="Toggle user status"
                            checked={user.isActive}
                            onCheckedChange={() => handleToggleStatus(user)}
                            disabled={activating[user._id]}
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {user.isActive ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => router.push(`/acl/users/${user._id}/edit`)}
                                  className="h-8 w-8"
                                >
                                  <FiEdit className="h-4 w-4" />
                                  <span className="sr-only">Edit user</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog(user)}
                                  className="h-8 w-8 text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                  <span className="sr-only">Deactivate user</span>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleActivateUser(user)}
                                  disabled={activating[user._id]}
                                  className="h-8 w-8 text-green-600 hover:text-green-900"
                                >
                                  {activating[user._id] ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-600"></div>
                                  ) : (
                                    <FiUserCheck className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Activate user</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog(user)}
                                  className="h-8 w-8 text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete user</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to deactivate the user "{userToDelete?.name}"? This action can be undone by reactivating the user.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={closeDeleteDialog}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? 'Deactivating...' : 'Deactivate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}