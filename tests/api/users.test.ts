/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';
import { NextResponse } from 'next/server';

// Mock dbConnect to use our test database
jest.mock('@/lib/dbConnect', () => {
  return jest.fn(() => Promise.resolve());
});

// Mock NextResponse.json to capture responses
const mockJson = jest.fn();
const mockNextResponseJson = jest.fn((data, init) => {
  mockJson(data, init);
  return { status: init?.status || 200 };
});

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: mockNextResponseJson,
  },
}));

// Mock auth middleware
jest.mock('@/lib/authMiddleware', () => ({
  withRole: jest.fn((request, allowedRoles) => {
    // Simulate successful authentication for admin
    if (allowedRoles.includes('admin')) {
      return Promise.resolve({ user: { role: 'admin' } });
    }
    // Simulate failed authentication
    return Promise.resolve(
      mockNextResponseJson({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    );
  })
}));

describe('User Management API Endpoints', () => {
  let mongoServer: MongoMemoryServer;
  let adminUser: any;
  let testUser: any;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    jest.clearAllMocks();
    
    // Create an admin user for testing protected endpoints
    const hashedPassword = await hashPassword('password123');
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin'
    });
    
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'cashier'
    });
  });

  describe('GET /api/users', () => {
    it('should list users when authenticated as admin', async () => {
      // Dynamically import the handler after setting up the mock
      const { GET: usersHandler } = await import('@/app/api/users/route');
      
      // Create a mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/users',
      } as unknown as Request;
      
      let users = await usersHandler(mockRequest as any);
      console.log('users', users);
      
      
      // Check if the response was successful
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
        expect.objectContaining({
          status: 200,
        })
      );
    });
  });

  // describe('POST /api/users', () => {
  //   it('should create a new user when authenticated as admin', async () => {
  //     // Dynamically import the handler after setting up the mock
  //     const { POST: usersHandler } = await import('@/app/api/users/route');
      
  //     // Create a mock request with admin authorization
  //     const mockRequest = {
  //       json: jest.fn().mockResolvedValue({
  //         name: 'New User',
  //         email: 'newuser@example.com',
  //         password: 'password123',
  //         role: 'cashier'
  //       }),
  //     } as unknown as Request;
      
  //     await usersHandler(mockRequest as any);
      
  //     // Check if the response was successful
  //     expect(mockJson).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         success: true,
  //       }),
  //       expect.objectContaining({
  //         status: 201,
  //       })
  //     );
      
  //     // Verify user was created in database
  //     const user = await User.findOne({ email: 'newuser@example.com' });
  //     expect(user).toBeDefined();
  //   });
  // });

  // describe('PUT /api/users/[id]', () => {
  //   it('should update a user when authenticated as admin', async () => {
  //     // Dynamically import the handler after setting up the mock
  //     const { PUT: userHandler } = await import('@/app/api/users/[id]/route');
      
  //     // Create a mock request with admin authorization
  //     const mockRequest = {
  //       json: jest.fn().mockResolvedValue({
  //         name: 'Updated User',
  //         role: 'admin'
  //       }),
  //     } as unknown as Request;
      
  //     await userHandler(mockRequest as any, { params: { id: testUser._id.toString() } });
      
  //     // Check if the response was successful
  //     expect(mockJson).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         success: true,
  //       }),
  //       expect.objectContaining({
  //         status: 200,
  //       })
  //     );
  //   });
  // });

  // describe('DELETE /api/users/[id]', () => {
  //   it('should deactivate a user when authenticated as admin', async () => {
  //     // Dynamically import the handler after setting up the mock
  //     const { DELETE: userHandler } = await import('@/app/api/users/[id]/route');
      
  //     // Create a mock request with admin authorization
  //     const mockRequest = {} as unknown as Request;
      
  //     await userHandler(mockRequest as any, { params: { id: testUser._id.toString() } });
      
  //     // Check if the response was successful
  //     expect(mockJson).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         success: true,
  //       }),
  //       expect.objectContaining({
  //         status: 200,
  //       })
  //     );
  //   });
  // });
});