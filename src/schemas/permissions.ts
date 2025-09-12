export enum Permissions {
  // User Permissions
  USERS_VIEW = 'users.view',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_ASSIGN_ROLES = 'users.assign_roles',

  // Role Permissions
  ROLES_VIEW = 'roles.view',
  ROLES_CREATE = 'roles.create',
  ROLES_UPDATE = 'roles.update',
  ROLES_DELETE = 'roles.delete',
  ROLES_ASSIGN_PERMISSIONS = 'roles.assign_permissions',

  // Permission Permissions
  PERMISSIONS_VIEW = 'permissions.view',
  PERMISSIONS_CREATE = 'permissions.create',
  PERMISSIONS_UPDATE = 'permissions.update',
  PERMISSIONS_DELETE = 'permissions.delete',
}
