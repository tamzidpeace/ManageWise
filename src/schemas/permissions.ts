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

  // Brand Permissions
  BRANDS_VIEW = 'brands.view',
  BRANDS_CREATE = 'brands.create',
  BRANDS_UPDATE = 'brands.update',
  BRANDS_DELETE = 'brands.delete',

  // Product Permissions
  PRODUCTS_VIEW = 'products.view',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',

  // Category Permissions
  CATEGORIES_VIEW = 'categories.view',
  CATEGORIES_CREATE = 'categories.create',
  CATEGORIES_UPDATE = 'categories.update',
  CATEGORIES_DELETE = 'categories.delete',
}
