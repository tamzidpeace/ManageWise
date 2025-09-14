'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';
import { useToast } from '@/hooks/useToast';

interface Permission {
  _id: string;
  name: string;
  description: string;
  feature: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch role and permissions
    fetchRoleAndPermissions();
  }, [isAuthenticated, router, params.id]);

  const fetchRoleAndPermissions = async () => {
    try {
      setLoading(true);

      // Fetch role details
      const roleResponse = await fetch(`/api/roles/${params.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleData = await roleResponse.json();

      if (!roleData.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: roleData.message || 'Failed to fetch role',
        });
        setLoading(false);
        return;
      }

      // Set role data
      setName(roleData.role.name);
      setDescription(roleData.role.description);
      setIsActive(roleData.role.isActive);
      setSelectedPermissions(roleData.role.permissions.map((p: Permission) => p._id));

      // Fetch all permissions
      const permissionsResponse = await fetch('/api/permissions?page=1&limit=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const permissionsData = await permissionsResponse.json();

      if (permissionsData.success) {
        setPermissions(permissionsData.permissions);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: permissionsData.message || 'Failed to fetch permissions',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while fetching role and permissions',
      });
      console.error('Error fetching role and permissions:', err);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      // First, update the role details
      const roleResponse = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: params.id,
          name,
          description,
          isActive,
        }),
      });

      const roleData = await roleResponse.json();

      if (!roleData.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: roleData.message || 'Failed to update role',
        });
        setSaving(false);
        return;
      }

      // Then, update the role's permissions
      const permissionsResponse = await fetch('/api/roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleId: params.id,
          permissionIds: selectedPermissions,
        }),
      });

      const permissionsData = await permissionsResponse.json();

      if (!permissionsData.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: permissionsData.message || 'Role updated but failed to update permissions',
        });
        setSaving(false);
        return;
      }

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Role updated successfully',
      });
      
      // Redirect to roles page after a short delay
      setTimeout(() => {
        router.push('/acl/roles');
      }, 1500);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating the role',
      });
      console.error('Error updating role:', err);
    } finally {
      setSaving(false);
    }
  };

  // Don't render the page if the user is not authenticated
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Edit Role</h1>
        <Button 
          onClick={() => router.push('/acl/roles')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Roles
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : (
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex items-center">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
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
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-50"
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}