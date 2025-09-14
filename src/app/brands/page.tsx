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

interface Brand {
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

export default function BrandsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [brands, setBrands] = useState<Brand[]>([]);
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
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<{[key: string]: boolean}>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch brands
    fetchBrands();
  }, [isAuthenticated, router]);

  const fetchBrands = useCallback(
    async (page: number = 1, search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`/api/brands?${queryParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setBrands(data.brands);
          setPagination(data.pagination || {
            page,
            limit: pagination.limit,
            total: data.brands.length,
            pages: 1
          });
        } else {
          setError(data.message || 'Failed to fetch brands');
        }
      } catch (err) {
        setError('An error occurred while fetching brands');
        console.error('Error fetching brands:', err);
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
      fetchBrands(1, value);
    }, 500); // 500ms debounce delay
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchBrands(newPage, searchTerm);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the brands list
        fetchBrands(pagination.page, searchTerm);
        setDeleteDialogOpen(false);
        setBrandToDelete(null);
      } else {
        setError(data.message || 'Failed to delete brand');
      }
    } catch (err) {
      setError('An error occurred while deleting the brand');
      console.error('Error deleting brand:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (brand: Brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  const handleToggleStatus = async (brand: Brand) => {
    try {
      // Set loading state for this brand
      setToggling(prev => ({ ...prev, [brand.id]: true }));
      
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !brand.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the brands list
        fetchBrands(pagination.page, searchTerm);
      } else {
        setError(data.message || 'Failed to update brand status');
      }
    } catch (err) {
      setError('An error occurred while updating the brand status');
      console.error('Error updating brand status:', err);
    } finally {
      // Remove loading state for this brand
      setToggling(prev => {
        const newState = { ...prev };
        delete newState[brand.id];
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
        <h1 className="text-2xl font-bold text-gray-800">Brand Management</h1>
        <Button onClick={() => router.push('/brands/create')}>
          Create Brand
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search brands..."
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
          {/* Brands Table */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {brands.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No brands found matching your search.'
                    : 'No brands found.'}
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
                    {brands.map((brand) => (
                      <tr key={brand.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {brand.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {brand.description || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Switch
                            aria-label="Toggle brand status"
                            checked={brand.isActive}
                            onCheckedChange={() => handleToggleStatus(brand)}
                            disabled={toggling[brand.id]}
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/brands/${brand.id}/edit`)}
                              className="h-8 w-8"
                            >
                              <FiEdit className="h-4 w-4" />
                              <span className="sr-only">Edit brand</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(brand)}
                              className="h-8 w-8 text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              <span className="sr-only">Delete brand</span>
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
                  Are you sure you want to delete the brand "{brandToDelete?.name}"? This action cannot be undone.
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
                  onClick={handleDeleteBrand}
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