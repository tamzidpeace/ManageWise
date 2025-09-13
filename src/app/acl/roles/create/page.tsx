'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

interface Permission {
  _id: string;
  name: string;
  description: string;
  feature: string;
}

export default function CreateRolePage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch permissions
    fetchPermissions();
  }, [isAuthenticated, router]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions?page=1&limit=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setPermissions(data.permissions);
      } else {
        setError(data.message || 'Failed to fetch permissions');
      }
    } catch (err) {
      setError('An error occurred while fetching permissions');
      console.error('Error fetching permissions:', err);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, create the role
      const roleResponse = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          isActive,
        }),
      });

      const roleData = await roleResponse.json();

      if (!roleData.success) {
        setError(roleData.message || 'Failed to create role');
        setLoading(false);
        return;
      }

      // If the role was created successfully and permissions were selected, assign them
      if (selectedPermissions.length > 0) {
        const assignResponse = await fetch('/api/roles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roleId: roleData.role.id,
            permissionIds: selectedPermissions,
          }),
        });

        const assignData = await assignResponse.json();

        if (!assignData.success) {
          setError(assignData.message || 'Role created but failed to assign permissions');
          setLoading(false);
          return;
        }
      }

      setSuccess('Role created successfully');
      // Reset form
      setName('');
      setDescription('');
      setSelectedPermissions([]);
      
      // Redirect to roles page after a short delay
      setTimeout(() => {
        router.push('/acl/roles');
      }, 1500);
    } catch (err) {
      setError('An error occurred while creating the role');
      console.error('Error creating role:', err);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-800">Create Role</h1>
        <Button onClick={() => router.push('/acl/roles')}>
          Back to Roles
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded border border-green-40 bg-green-100 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Role Name *
            </label>
            <input
              type="text"
              id="name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-50"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Permissions
            </label>
            <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300 p-4">
              {permissions.length === 0 ? (
                <p className="text-gray-500">No permissions available</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {permissions.map((permission) => (
                    <div key={permission._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`permission-${permission._id}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedPermissions.includes(permission._id)}
                        onChange={() => handlePermissionToggle(permission._id)}
                      />
                      <label
                        htmlFor={`permission-${permission._id}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/acl/roles')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}