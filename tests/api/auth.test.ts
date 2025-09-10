/**
 * @jest-environment node
 */
import { connectToTestDB, clearTestDB, disconnectFromTestDB } from '../test-db-setup';
import mongoose from 'mongoose';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

// We'll store the Next.js server instance
let server: any;

// Test database connection
let mongoUri: string;

describe('Auth API Endpoints (Laravel/Pest Style)', () => {
  // Start the Next.js server before running tests
  beforeAll(async () => {
    // Connect to test database
    await connectToTestDB();
    
    // Store the mongo URI for use in tests
    mongoUri = process.env.MONGODB_URI!;
    
    // Wait a bit for database connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  // Clear database between tests
  beforeEach(async () => {
    await clearTestDB();
    
    // Create a test user for login tests
    const hashedPassword = await hashPassword('password123');
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true
    });
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Make actual HTTP request to the running server
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      // Parse the response
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      // Make actual HTTP request to the running server
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      // Parse the response
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid credentials');
    });

    it('should fail login with non-existent user', async () => {
      // Make actual HTTP request to the running server
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      // Parse the response
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid credentials');
    });
  });
});