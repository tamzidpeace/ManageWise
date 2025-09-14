import Role from '@/models/Role';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Permission from '@/models/Permission';
import { Permissions } from '@/schemas/permissions';

export const createAdminUser = async () => {
  await dbConnect();

  try {
    // Check for existing permissions or create new ones
    const existingPermissions = await Permission.find({});
    let permissions;
    
    if (existingPermissions.length === 0) {
      // Create permissions only if none exist
      permissions = await Permission.insertMany([
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
      console.log('Created new permissions');
    } else {
      permissions = existingPermissions;
      console.log(`Using ${permissions.length} existing permissions`);
    }

    // Check for existing admin role or create new one
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator',
        permissions: permissions.map((p) => p._id),
        isActive: true
      });
      console.log('Created admin role');
    } else {
      console.log('Admin role already exists');
    }

    // Check for existing admin user or create new one
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      const hashedPassword = await hashPassword('password');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        roles: [adminRole._id],
        isActive: true,
      });
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }
    
    return { permissions, adminRole, adminUser };
  } catch (error) {
    console.error('Error in seeder:', error);
    throw error;
  }
};

// Run the seeder and properly close the connection
if (require.main === module) {
  createAdminUser().then(() => {
    console.log('Admin user setup completed');
    // Close the mongoose connection to allow the process to exit
    mongoose.connection.close();
  }).catch((error) => {
    console.error('Error setting up admin user:', error);
    // Close the mongoose connection even if there was an error
    mongoose.connection.close();
    process.exit(1);
  });
}

export default createAdminUser;
