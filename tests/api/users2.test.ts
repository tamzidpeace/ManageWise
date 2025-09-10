/**
 * @jest-environment node
 */
const { connectToTestDB, clearTestDB, disconnectFromTestDB } = require('../test-db-setup');
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

describe('User Management API Endpoints (Laravel/Pest Style)', () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await connectToTestDB();
  });

  // Create test data before each test
  beforeEach(async () => {
    // Create a test user for login tests
    const hashedPassword = await hashPassword('password');
    await User.create({
      name: 'Arafat User',
      email: 'arafat@mail.com',
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
        email: 'arafat@mail.com', 
        password: 'password' 
      }),
    });

    const data = await response.json();
    
    // Check that we get a successful response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
  });
});
