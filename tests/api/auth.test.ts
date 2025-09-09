/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

// Mock dbConnect to use our test database
jest.mock('@/lib/dbConnect', () => {
  return jest.fn(() => Promise.resolve());
});

// Mock NextResponse.json to capture responses
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => {
      mockJson(data, init);
      return { status: init?.status || 200 };
    }),
  },
}));

describe('Auth API Endpoints', () => {
  let mongoServer: MongoMemoryServer;

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
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      } as unknown as Request;

      await registerHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
        }),
        { status: 201 }
      );

      // Verify user was created in database
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeDefined();
      expect(user?.name).toBe('John Doe');
    });

    it('should fail to register with duplicate email', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      
      // Create existing user
      const hashedPassword = await hashPassword('password123');
      await User.create({
        name: 'Existing User',
        email: 'john@example.com',
        passwordHash: hashedPassword,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      } as unknown as Request;

      await registerHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User with this email already exists',
        }),
        { status: 409 }
      );
    });

    it('should fail to register with invalid data', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: '',
          email: 'invalid-email',
          password: '123',
        }),
      } as unknown as Request;

      await registerHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
        }),
        { status: 400 }
      );
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await hashPassword('password123');
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'cashier',
      });
    });

    it('should login with valid credentials', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: loginHandler } = await import('@/app/api/auth/login/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'john@example.com',
          password: 'password123',
        }),
      } as unknown as Request;

      await loginHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          user: expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            role: 'cashier',
          }),
        }),
        { status: 200 }
      );
    });

    it('should fail to login with invalid credentials', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: loginHandler } = await import('@/app/api/auth/login/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'john@example.com',
          password: 'wrongpassword',
        }),
      } as unknown as Request;

      await loginHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        }),
        { status: 401 }
      );
    });

    it('should fail to login with non-existent user', async () => {
      // Dynamically import the handler after setting up the mock
      const { POST: loginHandler } = await import('@/app/api/auth/login/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      } as unknown as Request;

      await loginHandler(mockRequest as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        }),
        { status: 401 }
      );
    });
  });
});