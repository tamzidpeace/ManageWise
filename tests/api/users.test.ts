/**
 * @jest-environment node
 */
const {
  connectToTestDB,
  clearTestDB,
  disconnectFromTestDB,
} = require('../test-db-setup');
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

describe('User Management API Endpoints (Laravel/Pest Style)', () => {
  let adminToken: string;

  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
    // Clear database first
    await clearTestDB();
    
    // Create an admin user for testing
    const hashedPassword = await hashPassword('password123');
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    // Create a cashier user for testing
    await User.create({
      name: 'Cashier User',
      email: 'cashier@test.com',
      passwordHash: hashedPassword,
      role: 'cashier',
      isActive: true,
    });

    // Login as admin to get a token for authenticated requests
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;
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
        email: 'admin@test.com',
        password: 'password123',
      }),
    });

    const data = await response.json();

    // Check that we get a successful response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
  });

  test('should fetch users list with valid admin token', async () => {
    // Fetch users with admin token
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    // We expect 2 users (admin and cashier)
    expect(data.users.length).toBe(2);

    // Check that passwordHash is not included
    expect(data.users[0].passwordHash).toBeUndefined();
    expect(data.users[1].passwordHash).toBeUndefined();
  });

  test('should create a new user with valid admin token', async () => {
    // Create a new user
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'New Test User',
        email: 'newuser@test.com',
        password: 'newpassword123',
        role: 'cashier',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('User created successfully');
    expect(data.user).toBeDefined();
    expect(data.user.name).toBe('New Test User');
    expect(data.user.email).toBe('newuser@test.com');
    expect(data.user.role).toBe('cashier');

    // Verify user was actually created in database
    const createdUser = await User.findOne({ email: 'newuser@test.com' });
    expect(createdUser).toBeDefined();
    expect(createdUser?.name).toBe('New Test User');
  });
});
