/**
 * @jest-environment node
 */
import { Permissions } from '@/schemas/permissions';
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import Brand from '@/models/Brand';
import { hashPassword } from '@/utils/password';

describe('Brand API Endpoints', () => {
  let adminToken: string;
  let brandId: string;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    const permissions = await Permission.insertMany([
        { name: 'brands.view', feature: 'brands' },
        { name: 'brands.create', feature: 'brands' },
        { name: 'brands.update', feature: 'brands' },
        { name: 'brands.delete', feature: 'brands' },
    ]);

    const adminRole = await Role.create({ name: 'admin', description: 'Administrator', permissions: permissions.map(p => p._id) });

    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      roles: [adminRole._id],
      isActive: true
    });
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  test('should create a new brand with valid data', async () => {
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

    const response = await fetch('http://localhost:3000/api/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Brand',
        description: 'A test brand',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.brand).toBeDefined();
    expect(data.brand.name).toBe('Test Brand');
    brandId = data.brand.id;
  });

  test('should fetch brands list with valid admin token', async () => {
    await Brand.create({ name: 'Test Brand 1' });
    await Brand.create({ name: 'Test Brand 2' });

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

    const response = await fetch('http://localhost:3000/api/brands', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.brands).toBeDefined();
    expect(Array.isArray(data.brands)).toBe(true);
    expect(data.brands.length).toBeGreaterThan(0);
  });

  test('should update a brand with valid data', async () => {
    const brand = await Brand.create({ name: 'Test Brand' });

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

    const response = await fetch(`http://localhost:3000/api/brands/${brand._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Updated Test Brand',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.brand).toBeDefined();
    expect(data.brand.name).toBe('Updated Test Brand');
  });

  test('should delete a brand with valid admin token', async () => {
    const brand = await Brand.create({ name: 'Test Brand' });

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

    const response = await fetch(`http://localhost:3000/api/brands/${brand._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

