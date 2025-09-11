/**
 * @jest-environment node
 */
const {
  connectToTestDB,
  clearTestDB,
  disconnectFromTestDB,
} = require('../test-db-setup');
import User from '@/models/User';
import Role from '@/models/Role';
import { hashPassword } from '@/utils/password';

describe('User Roles API Endpoint', () => {
  let adminToken: string;
  let adminUser: any;
  let cashierUser: any;
  let managerRole: any;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const adminRole = await Role.create({ name: 'admin', description: 'Administrator' });
    managerRole = await Role.create({ name: 'manager', description: 'Manager' });

    const adminPassword = await hashPassword('password123');
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: adminPassword,
      roles: [adminRole._id],
      isActive: true,
    });

    const cashierPassword = await hashPassword('password123');
    cashierUser = await User.create({
        name: 'Cashier User',
        email: 'cashier@test.com',
        passwordHash: cashierPassword,
        roles: [],
        isActive: true,
    });

    const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
    });
    const adminLoginData = await adminLoginResponse.json();
    adminToken = adminLoginData.token;
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  test('should assign roles to a user', async () => {
    const response = await fetch(`http://localhost:3000/api/users/${cashierUser._id}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ roles: [managerRole._id] }),
      }
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.roles).toHaveLength(1);
    expect(data.user.roles[0].name).toBe('manager');

    const updatedUser = await User.findById(cashierUser._id);
    expect(updatedUser?.roles).toHaveLength(1);
    expect(updatedUser?.roles[0].toString()).toBe(managerRole._id.toString());
  });

  test('should fail to assign roles with non-existent role', async () => {
    const nonExistentRoleId = '60f7e2a3b3f3b3f3b3f3b3f3';
    const response = await fetch(`http://localhost:3000/api/users/${cashierUser._id}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ roles: [nonExistentRoleId] }),
      }
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('One or more roles not found');
  });

  test('should fail to assign roles to non-existent user', async () => {
    const nonExistentUserId = '60f7e2a3b3f3b3f3b3f3b3f3';
    const response = await fetch(`http://localhost:3000/api/users/${nonExistentUserId}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ roles: [managerRole._id] }),
      }
    );

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('User not found');
  });

  test('should fail to assign roles without admin token', async () => {
    const response = await fetch(`http://localhost:3000/api/users/${cashierUser._id}/roles`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: [managerRole._id] }),
      }
    );

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Authentication required');
  });
});
