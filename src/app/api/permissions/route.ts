import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Permission from '@/models/Permission';
import { withRole } from '@/lib/authMiddleware';
import { handleZodError } from '@/utils/validation';
import { z } from 'zod';

// Schema for creating permission
const PermissionCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  feature: z.string().min(1, 'Feature is required').max(50, 'Feature must be less than 50 characters'),
});

// Schema for updating permission
const PermissionUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  feature: z.string().min(1, 'Feature is required').max(50, 'Feature must be less than 50 characters').optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Only admin can list permissions
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const feature = searchParams.get('feature');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (feature) {
      query.feature = feature;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Fetch permissions with pagination
    const permissions = await Permission.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Permission.countDocuments(query);
    
    return NextResponse.json(
      { 
        success: true,
        permissions,
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
    console.error('Permissions list error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin can create permissions
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = PermissionCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, description, feature } = validation.data;
    
    // Check if permission with this name already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return NextResponse.json(
        { success: false, message: 'Permission with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new permission
    const permission = new Permission({
      name,
      description,
      feature,
    });
    
    await permission.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permission created successfully',
        permission: {
          id: permission._id,
          name: permission.name,
          description: permission.description,
          feature: permission.feature,
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Permission creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the permission' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Only admin can update permissions
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = PermissionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { id, name, description, feature } = body;
    
    // Check if permission exists
    const permission = await Permission.findById(id);
    if (!permission) {
      return NextResponse.json(
        { success: false, message: 'Permission not found' },
        { status: 404 }
      );
    }
    
    // Check if another permission with this name already exists
    if (name && name !== permission.name) {
      const existingPermission = await Permission.findOne({ name });
      if (existingPermission) {
        return NextResponse.json(
          { success: false, message: 'Permission with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update permission fields
    if (name !== undefined) permission.name = name;
    if (description !== undefined) permission.description = description;
    if (feature !== undefined) permission.feature = feature;
    
    await permission.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permission updated successfully',
        permission: {
          id: permission._id,
          name: permission.name,
          description: permission.description,
          feature: permission.feature,
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Permission update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating the permission' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only admin can delete permissions
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { id } = body;
    
    // Check if permission exists
    const permission = await Permission.findById(id);
    if (!permission) {
      return NextResponse.json(
        { success: false, message: 'Permission not found' },
        { status: 404 }
      );
    }
    
    // Delete permission
    await Permission.findByIdAndDelete(id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permission deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Permission deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while deleting the permission' },
      { status: 500 }
    );
  }
}