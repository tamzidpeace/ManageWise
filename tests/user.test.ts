/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';
import { UserRegistrationSchema } from '@/schemas';

// Mock dbConnect to avoid connection issues
jest.mock('@/lib/dbConnect', () => {
  return jest.fn(() => Promise.resolve());
});

describe('User Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    
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
  });

  describe('User Registration', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin'
      };

      // Validate data with Zod schema
      const validation = UserRegistrationSchema.safeParse(userData);
      expect(validation.success).toBe(true);

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role
      });

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create first user
      const hashedPassword = await hashPassword(userData.password);
      await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword
      });

      // Try to create second user with same email
      await expect(
        User.create({
          name: 'Jane Doe',
          email: userData.email,
          passwordHash: hashedPassword
        })
      ).rejects.toThrow();
    });

    it('should fail to create user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const validation = UserRegistrationSchema.safeParse(userData);
      expect(validation.success).toBe(false);
    });
  });
});