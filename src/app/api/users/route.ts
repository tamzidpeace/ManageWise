import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Role from '@/models/Role';
import { withPermission } from '@/lib/authMiddleware';
import { hashPassword } from '@/utils/password';
import { handleZodError } from '@/utils/validation';
import { UserRegistrationSchema } from '@/schemas';

export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission(request, 'users.view');
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleName = searchParams.get('role') || '';
    
    // Build filter object
    const filter: any = {};
    
    // Only show active users
    filter.isActive = true;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (role) {
        filter.roles = role._id;
      }
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const users = await User.find(filter)
      .populate('roles')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordHash'); // Exclude password hash from response
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    return NextResponse.json(
      { 
        success: true, 
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission(request, 'users.create');
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = UserRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, email, password, roles } = validation.data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      roles: roles || [],
    });
    
    // Return success response (without password hash)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
}