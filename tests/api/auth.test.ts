/**
 * @jest-environment node
 */
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

describe('Auth API Endpoints (Laravel/Pest Style)', () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
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

  // Clear database after each test
  afterEach(async () => {
    await clearTestDB();
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await disconnectFromTestDB();
  });

  test('should login with valid credentials', async () => {
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

    const data = await response.json();
    
    // Check that we get a successful response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });

  test('should fail login with invalid credentials', async () => {
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

    const data = await response.json();
    
    // Check that we get a failed response
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid credentials');
  });

  test('should fail login with non-existent user', async () => {
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

    const data = await response.json();
    
    // Check that we get a failed response
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid credentials');
  });
});