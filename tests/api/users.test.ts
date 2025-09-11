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
  let cashierToken: string;

  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
    // Clear database first
    await clearTestDB();
    
    // Create an admin user for testing
    const adminPassword = await hashPassword('password123');
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    });

    // Create a cashier user for testing
    const cashierPassword = await hashPassword('password123');
    await User.create({
      name: 'Cashier User',
      email: 'cashier@test.com',
      passwordHash: cashierPassword,
      role: 'cashier',
      isActive: true,
    });

    // Login as admin to get a token for authenticated requests
    const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123',
      }),
    });

    const adminLoginData = await adminLoginResponse.json();
    adminToken = adminLoginData.token;

    // Login as cashier to get a token for authenticated requests
    const cashierLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cashier@test.com',
        password: 'password123',
      }),
    });

    const cashierLoginData = await cashierLoginResponse.json();
    cashierToken = cashierLoginData.token;
  });

  // Clear database after each test
  afterEach(async () => {
    await clearTestDB();
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await disconnectFromTestDB();
  });

  // Test user login
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
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('admin@test.com');
    expect(data.user.role).toBe('admin');
  });

  // Test user login with invalid credentials
  test('should fail login with invalid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'wrongpassword',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid credentials');
  });

  // Test fetching users list with valid admin token
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

    // Check pagination data
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  // Test fetching users list with search parameter
  test('should fetch users list with search parameter', async () => {
    // Fetch users with search parameter
    const response = await fetch('http://localhost:3000/api/users?search=admin', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    // We expect 1 user (admin)
    expect(data.users.length).toBe(1);
    expect(data.users[0].email).toBe('admin@test.com');
  });

  // Test fetching users list with role filter
  test('should fetch users list with role filter', async () => {
    // Fetch users with role filter
    const response = await fetch('http://localhost:3000/api/users?role=cashier', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    // We expect 1 user (cashier)
    expect(data.users.length).toBe(1);
    expect(data.users[0].role).toBe('cashier');
  });

  // Test fetching users list with pagination
  test('should fetch users list with pagination', async () => {
    // Create additional users for pagination test
    const hashedPassword = await hashPassword('password123');
    for (let i = 1; i <= 5; i++) {
      await User.create({
        name: `Test User ${i}`,
        email: `test${i}@test.com`,
        passwordHash: hashedPassword,
        role: 'cashier',
        isActive: true,
      });
    }

    // Fetch users with pagination
    const response = await fetch('http://localhost:3000/api/users?page=1&limit=3', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    // We expect 3 users due to limit
    expect(data.users.length).toBe(3);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(3);
    expect(data.pagination.total).toBe(7); // admin + cashier + 5 test users
  });

  // Test creating a new user with valid admin token
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
    expect(data.user.isActive).toBe(true);

    // Verify user was actually created in database
    const createdUser = await User.findOne({ email: 'newuser@test.com' });
    expect(createdUser).toBeDefined();
    expect(createdUser?.name).toBe('New Test User');
    expect(createdUser?.role).toBe('cashier');
    expect(createdUser?.isActive).toBe(true);
  });

  // Test creating a user with duplicate email
  test('should fail to create user with duplicate email', async () => {
    // Try to create a user with existing email
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: 'admin@test.com', // This email already exists
        password: 'newpassword123',
        role: 'cashier',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.message).toBe('User with this email already exists');
  });

  // Test creating a user with missing required fields
  test('should fail to create user with missing required fields', async () => {
    // Try to create a user with missing name
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        email: 'incomplete@test.com',
        password: 'newpassword123',
        // Missing name
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  // Test creating a user with invalid email format
  test('should fail to create user with invalid email format', async () => {
    // Try to create a user with invalid email
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'invalid-email', // Invalid email format
        password: 'newpassword123',
        role: 'cashier',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  // Test creating a user without admin token (unauthorized)
  test('should fail to create user without valid admin token', async () => {
    // Try to create a user without authorization
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({
        name: 'Unauthorized User',
        email: 'unauthorized@test.com',
        password: 'newpassword123',
        role: 'cashier',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Authentication required');
  });

  // Test creating a user with cashier token (forbidden)
  test('should fail to create user with cashier token', async () => {
    // Try to create a user with cashier token
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`, // Cashier token, not admin
      },
      body: JSON.stringify({
        name: 'Forbidden User',
        email: 'forbidden@test.com',
        password: 'newpassword123',
        role: 'cashier',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Insufficient permissions');
  });

  // Test creating a user with default role
  test('should create a user with default cashier role when not specified', async () => {
    // Create a user without specifying role
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Default Role User',
        email: 'defaultrole@test.com',
        password: 'newpassword123',
        // No role specified, should default to 'cashier'
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('cashier'); // Should default to cashier

    // Verify in database
    const createdUser = await User.findOne({ email: 'defaultrole@test.com' });
    expect(createdUser?.role).toBe('cashier');
  });
});
