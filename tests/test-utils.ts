import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

// Mock bcrypt functions for faster tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Generate a test JWT token
export function generateTestToken(user: Partial<IUser>) {
  return jwt.sign(
    {
      userId: user._id || 'test-user-id',
      email: user.email || 'test@example.com',
      role: user.role || 'cashier',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
}

// Create a mock user object
export function createMockUser(overrides = {}) {
  return {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'cashier',
    isActive: true,
    ...overrides,
  };
}

// Create authenticated request helper
export function createAuthHeaders(user: Partial<IUser>) {
  const token = generateTestToken(user);
  return {
    Authorization: `Bearer ${token}`,
  };
}