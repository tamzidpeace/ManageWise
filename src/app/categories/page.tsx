'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  description?: string;
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

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<{[key: string]: boolean}>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch categories
    fetchCategories();
  }, [isAuthenticated, router]);

  const fetchCategories = useCallback(
    async (page: number = 1, search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`/api/categories?${queryParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
          setPagination(data.pagination || {
            page,
            limit: pagination.limit,
            total: data.categories.length,
            pages: 1
          });
        } else {
          setError(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        setError('An error occurred while fetching categories');
        console.error('Error fetching categories:', err);
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
      fetchCategories(1, value);
    }, 500); // 500ms debounce delay
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchCategories(newPage, searchTerm);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the categories list
        fetchCategories(pagination.page, searchTerm);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('An error occurred while deleting the category');
      console.error('Error deleting category:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      // Set loading state for this category
      setToggling(prev => ({ ...prev, [category.id]: true }));
      
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !category.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the categories list
        fetchCategories(pagination.page, searchTerm);
      } else {
        setError(data.message || 'Failed to update category status');
      }
    } catch (err) {
      setError('An error occurred while updating the category status');
      console.error('Error updating category status:', err);
    } finally {
      // Remove loading state for this category
      setToggling(prev => {
        const newState = { ...prev };
        delete newState[category.id];
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
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <Button onClick={() => router.push('/categories/create')}>
          Create Category
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded border border-red-400 bg-red-10 px-4 py-3 text-red-700">
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
          {/* Categories Table */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {categories.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No categories found matching your search.'
                    : 'No categories found.'}
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
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Created At
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Status
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
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {category.description || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Switch
                            aria-label="Toggle category status"
                            checked={category.isActive}
                            onCheckedChange={() => handleToggleStatus(category)}
                            disabled={toggling[category.id]}
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/categories/${category.id}/edit`)}
                              className="h-8 w-8"
                            >
                              <FiEdit className="h-4 w-4" />
                              <span className="sr-only">Edit category</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(category)}
                              className="h-8 w-8 text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              <span className="sr-only">Delete category</span>
                            </Button>
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
                  Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
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
                  onClick={handleDeleteCategory}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}