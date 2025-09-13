import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { withPermission } from '@/lib/authMiddleware';
import { Permissions } from '@/schemas/permissions';
import { handleZodError } from '@/utils/validation';
import { z } from 'zod';

// Schema for updating user
const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  roles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, Permissions.USERS_VIEW);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Find user by ID and populate roles
    const user = await User.findById(params.id).populate('roles');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data (without password hash)
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching the user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, Permissions.USERS_UPDATE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = UserUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, email, roles, isActive } = validation.data;
    
    // Find user by ID
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update user fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (roles !== undefined) user.roles = roles;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Save updated user
    await user.save();
    
    // Populate roles for response
    await user.populate('roles');
    
    // Return success response (without password hash)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating the user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, Permissions.USERS_DELETE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Find user by ID
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User deactivated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User deactivation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while deactivating the user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, Permissions.USERS_UPDATE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Find user by ID
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Activate user
    user.isActive = true;
    await user.save();
    
    // Populate roles for response
    await user.populate('roles');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User activated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User activation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while activating the user' },
      { status: 500 }
    );
  }
}