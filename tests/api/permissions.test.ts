/**
 * @jest-environment node
 */
import { Permissions } from '@/schemas/permissions';
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import { hashPassword } from '@/utils/password';

describe('Permission API Endpoints (Laravel/Pest Style)', () => {
  let adminToken: string;

  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
    // Create permissions
    const permissions = await Permission.insertMany([
      { name: Permissions.USERS_VIEW, feature: 'users' },
      { name: Permissions.USERS_CREATE, feature: 'users' },
      { name: Permissions.USERS_UPDATE, feature: 'users' },
      { name: Permissions.USERS_DELETE, feature: 'users' },
      { name: Permissions.USERS_ASSIGN_ROLES, feature: 'users' },
      { name: Permissions.ROLES_VIEW, feature: 'roles' },
      { name: Permissions.ROLES_CREATE, feature: 'roles' },
      { name: Permissions.ROLES_UPDATE, feature: 'roles' },
      { name: Permissions.ROLES_DELETE, feature: 'roles' },
      { name: Permissions.ROLES_ASSIGN_PERMISSIONS, feature: 'roles' },
      { name: Permissions.PERMISSIONS_VIEW, feature: 'permissions' },
      { name: Permissions.PERMISSIONS_CREATE, feature: 'permissions' },
      { name: Permissions.PERMISSIONS_UPDATE, feature: 'permissions' },
      { name: Permissions.PERMISSIONS_DELETE, feature: 'permissions' },
    ]);

    // Create an admin role
    const adminRole = await Role.create({ 
      name: 'admin', 
      description: 'Administrator',
      permissions: permissions.map(p => p._id)
    });

    // Create an admin user for testing
    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      roles: [adminRole._id],
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

  // Test creating a new permission
  test('should create a new permission with valid data', async () => {
    // First login as admin to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'view-users',
        description: 'Permission to view users',
        feature: 'user-management',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Permission created successfully');
    expect(data.permission).toBeDefined();
    expect(data.permission.name).toBe('view-users');
    expect(data.permission.description).toBe('Permission to view users');
    expect(data.permission.feature).toBe('user-management');
  });

  // Test getting permissions list
  test('should fetch permissions list with valid admin token', async () => {
    // First login as admin to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.permissions).toBeDefined();
    expect(Array.isArray(data.permissions)).toBe(true);
    expect(data.permissions.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  // Test updating a permission
  test('should update a permission with valid data', async () => {
    // First login as admin to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;

    const permission = await Permission.findOne({ name: Permissions.USERS_VIEW });

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: permission._id,
        name: 'delete-users-updated',
        description: 'Updated permission to delete users',
        feature: 'user-management-updated',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Permission updated successfully');
    expect(data.permission).toBeDefined();
    expect(data.permission.name).toBe('delete-users-updated');
    expect(data.permission.description).toBe('Updated permission to delete users');
    expect(data.permission.feature).toBe('user-management-updated');
  });

  // Test deleting a permission
  test('should delete a permission with valid admin token', async () => {
    // First login as admin to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;

    const permission = await Permission.findOne({ name: Permissions.USERS_VIEW });

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: permission._id,
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Permission deleted successfully');
  });

  // Test permission creation with duplicate name
  test('should fail to create permission with duplicate name', async () => {
    // First login as admin to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    adminToken = loginData.token;

    // Try to create another permission with the same name
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: Permissions.USERS_VIEW,
        description: 'Another test permission',
        feature: 'test-feature',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Permission with this name already exists');
  });

  // Test unauthorized access
  test('should fail to create permission without valid token', async () => {
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No authorization header
      },
      body: JSON.stringify({
        name: 'unauthorized-test',
        description: 'Test permission',
        feature: 'test-feature',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Authentication required');
  });
});
