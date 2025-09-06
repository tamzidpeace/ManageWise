import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

export async function createAdminUser() {
  try {
    await dbConnect();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }
    
    // Hash password
    const hashedPassword = await hashPassword('admin123');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
    });
    
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}