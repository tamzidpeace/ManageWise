import Role from '@/models/Role';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';
import dbConnect from '@/lib/dbConnect';
import Permission from '@/models/Permission';
import { Permissions } from '@/schemas/permissions';

export const createAdminUser = async () => {
  await dbConnect();

  // Create permissions
  const permissions = await Permission.insertMany([
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

  // Create an admin role
  const adminRole = await Role.create({
    name: 'admin',
    description: 'Administrator',
    permissions: permissions.map((p) => p._id),
  });

  const hashedPassword = await hashPassword('password');
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: hashedPassword,
    roles: [adminRole._id],
    isActive: true,
  });
};

createAdminUser();
