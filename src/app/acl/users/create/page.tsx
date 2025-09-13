'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

interface Role {
  _id: string;
  name: string;
  description: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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

    // Fetch roles
    fetchRoles();
  }, [isAuthenticated, router]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles?page=1&limit=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setRoles(data.roles);
      } else {
        setError(data.message || 'Failed to fetch roles');
      }
    } catch (err) {
      setError('An error occurred while fetching roles');
      console.error('Error fetching roles:', err);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          roles: selectedRoles,
          isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('User created successfully');
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSelectedRoles([]);
        
        // Redirect to users page after a short delay
        setTimeout(() => {
          router.push('/acl/users');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred while creating the user');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render the page if the user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-90"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Create User</h1>
        <Button 
          onClick={() => router.push('/acl/users')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
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
              Full Name *
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              id="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long.</p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex items-center">
              <Toggle
                aria-label="Toggle user status"
                pressed={isActive}
                onPressedChange={setIsActive}
                className="h-8 w-8"
              >
                {isActive ? <FiCheck className="h-4 w-4" /> : <FiX className="h-4 w-4" />}
              </Toggle>
              <span className="ml-2 text-sm text-gray-900">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Roles
            </label>
            <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300 p-4">
              {roles.length === 0 ? (
                <p className="text-gray-500">No roles available</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {roles.map((role) => (
                    <div key={role._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role._id}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedRoles.includes(role._id)}
                        onChange={() => handleRoleToggle(role._id)}
                      />
                      <label
                        htmlFor={`role-${role._id}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {role.name}
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
              onClick={() => router.push('/acl/users')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}