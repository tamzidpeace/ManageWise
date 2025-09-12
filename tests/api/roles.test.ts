/**
 * @jest-environment node
 */
import { Permissions } from '@/schemas/permissions';
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import { hashPassword } from '@/utils/password';

describe('Role API Endpoints (Laravel/Pest Style)', () => {
  let adminToken: string;
  let adminRole: any;

  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
    // Create permissions
    const permissions = await Permission.insertMany([
        { name: Permissions.ROLES_VIEW, feature: 'roles' },
        { name: Permissions.ROLES_CREATE, feature: 'roles' },
        { name: Permissions.ROLES_UPDATE, feature: 'roles' },
        { name: Permissions.ROLES_DELETE, feature: 'roles' },
        { name: Permissions.ROLES_ASSIGN_PERMISSIONS, feature: 'roles' },
    ]);

    // Create an admin role
    adminRole = await Role.create({ name: 'admin', description: 'Administrator', permissions: permissions.map(p => p._id) });

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

  // Test creating a new role
  test('should create a new role with valid data', async () => {
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
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'manager',
        description: 'Manager role with limited permissions',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Role created successfully');
    expect(data.role).toBeDefined();
    expect(data.role.name).toBe('manager');
    expect(data.role.description).toBe('Manager role with limited permissions');
    expect(Array.isArray(data.role.permissions)).toBe(true);
  });

  // Test getting roles list
  test('should fetch roles list with valid admin token', async () => {
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
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.roles).toBeDefined();
    expect(Array.isArray(data.roles)).toBe(true);
    expect(data.roles.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  // Test updating a role
  test('should update a role with valid data', async () => {
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

    const role = await Role.findOne({ name: 'admin' });

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: role._id,
        name: 'viewer-updated',
        description: 'Updated viewer role',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Role updated successfully');
    expect(data.role).toBeDefined();
    expect(data.role.name).toBe('viewer-updated');
    expect(data.role.description).toBe('Updated viewer role');
  });

  // Test deleting a role
  test('should delete a role with valid admin token', async () => {
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

    const role = await Role.findOne({ name: 'admin' });

    // Make actual HTTP request to the running server
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        id: role._id,
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Role deleted successfully');
  });

  // Test role creation with duplicate name
  test('should fail to create role with duplicate name', async () => {
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

    // Try to create another role with the same name
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'admin',
        description: 'Another test role',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Role with this name already exists');
  });

  // Test assigning permissions to role
  test('should assign permissions to role successfully', async () => {
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

    const role = await Role.findOne({ name: 'admin' });

    // Create some permissions
    const permission1 = await Permission.create({
      name: 'view-dashboard',
      description: 'Permission to view dashboard',
      feature: 'dashboard',
    });

    const permission2 = await Permission.create({
      name: 'edit-profile',
      description: 'Permission to edit profile',
      feature: 'user',
    });

    // Assign permissions to role
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        roleId: role._id,
        permissionIds: [permission1._id.toString(), permission2._id.toString()],
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Permissions assigned to role successfully');
    expect(data.role).toBeDefined();
    expect(data.role.permissions).toBeDefined();
    expect(Array.isArray(data.role.permissions)).toBe(true);
    expect(data.role.permissions.length).toBe(2);
  });

  // Test cloning a role
  test('should clone a role successfully', async () => {
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

    const role = await Role.findOne({ name: 'admin' });

    // Clone the role
    const response = await fetch(`http://localhost:3000/api/roles/${role._id}/clone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.role).toBeDefined();
    expect(data.role.name).toBe('Copy of admin');
  });

  // Test unauthorized access
  test('should fail to create role without valid token', async () => {
    const response = await fetch('http://localhost:3000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No authorization header
      },
      body: JSON.stringify({
        name: 'unauthorized-test',
        description: 'Test role',
      }),
    });

    const data = await response.json();

    // Assertions
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Authentication required');
  });
});
