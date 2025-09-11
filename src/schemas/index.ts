import { z } from 'zod';

// User schemas
export const UserRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Category schemas
export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Brand schemas
export const BrandCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Product schemas
export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  price: z.number().min(0, 'Price must be a non-negative number'),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  image: z.string().optional(),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  brandId: z.string().optional(),
  price: z.number().min(0, 'Price must be a non-negative number').optional(),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Order schemas
export const OrderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Order must have at least one item'),
  paymentMethod: z.enum(['cash', 'card'], 'Payment method must be either cash or card'),
  discountAmount: z.number().min(0, 'Discount amount must be a non-negative number').optional(),
});

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
});