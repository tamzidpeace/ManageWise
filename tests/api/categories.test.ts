/**
 * @jest-environment node
 */
import { Permissions } from '@/schemas/permissions';
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import Category from '@/models/Category';
import { hashPassword } from '@/utils/password';

describe('Category API Endpoints', () => {
  let adminToken: string;
  let categoryId: string;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    // Create permissions for categories
    const permissions = await Permission.insertMany([
        { name: 'categories.view', feature: 'categories' },
        { name: 'categories.create', feature: 'categories' },
        { name: 'categories.update', feature: 'categories' },
        { name: 'categories.delete', feature: 'categories' },
    ]);

    // Create admin role with category permissions
    const adminRole = await Role.create({ 
      name: 'admin', 
      description: 'Administrator', 
      permissions: permissions.map(p => p._id) 
    });

    // Create admin user
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

  test('should create a new category with valid data', async () => {
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

    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Category',
        description: 'A test category',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.category).toBeDefined();
    expect(data.category.name).toBe('Test Category');
    categoryId = data.category.id;
  });

  test('should not create a category without required fields', async () => {
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

    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'No name provided',
      }),
    });

    expect(response.status).toBe(400);
  });

  test('should not create a category with duplicate name', async () => {
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

    // Create first category
    await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Test',
        description: 'First instance',
      }),
    });

    // Try to create another with the same name
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Test',
        description: 'Second instance',
      }),
    });

    expect(response.status).toBe(409);
  });

  test('should fetch categories list with valid admin token', async () => {
    await Category.create({ name: 'Test Category 1' });
    await Category.create({ name: 'Test Category 2' });

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

    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.categories).toBeDefined();
    expect(Array.isArray(data.categories)).toBe(true);
    expect(data.categories.length).toBeGreaterThan(0);
  });

  test('should fetch categories with pagination', async () => {
    // Create multiple categories
    for (let i = 1; i <= 5; i++) {
      await Category.create({ 
        name: `Test Category ${i}`,
        description: `Description for category ${i}`
      });
    }

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

    const response = await fetch('http://localhost:3000/api/categories?page=1&limit=3', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.categories.length).toBeLessThanOrEqual(3);
    expect(data.pagination).toBeDefined();
  });

  test('should search categories by name', async () => {
    await Category.create({ name: 'Electronics', description: 'Electronic devices' });
    await Category.create({ name: 'Books', description: 'Books and literature' });

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

    const response = await fetch('http://localhost:3000/api/categories?search=Electronics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.categories.length).toBeGreaterThanOrEqual(1);
  });

  test('should get a specific category by ID', async () => {
    const category = await Category.create({ 
      name: 'Specific Category',
      description: 'A specific category for testing'
    });
    
    categoryId = category._id.toString();

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

    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.category).toBeDefined();
    expect(data.category.id).toBe(categoryId);
  });

  test('should update a category with valid data', async () => {
    const category = await Category.create({ name: 'Test Category' });
    categoryId = category._id.toString();

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

    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Updated Test Category',
        description: 'Updated description'
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.category).toBeDefined();
    expect(data.category.name).toBe('Updated Test Category');
    expect(data.category.description).toBe('Updated description');
  });

  test('should update only the category status', async () => {
    const category = await Category.create({ 
      name: 'Status Test Category',
      description: 'For status update testing'
    });
    categoryId = category._id.toString();

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

    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        isActive: false
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.category).toBeDefined();
    expect(data.category.isActive).toBe(false);
  });

  test('should not update a category with duplicate name', async () => {
    await Category.create({ name: 'Existing Category' });
    const category = await Category.create({ name: 'Another Category' });
    categoryId = category._id.toString();

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

    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Existing Category' // Same as the first category
      }),
    });

    expect(response.status).toBe(409);
  });

  test('should delete a category with valid admin token', async () => {
    const category = await Category.create({ name: 'Test Category' });
    categoryId = category._id.toString();

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

    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('should return 404 for non-existent category', async () => {
    const fakeId = '507f1f7bcf86cd799439011'; // Valid ObjectId format

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

    const response = await fetch(`http://localhost:3000/api/categories/${fakeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    expect(response.status).toBe(404);
  });
});