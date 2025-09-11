import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import { withRole } from '@/lib/authMiddleware';
import { handleZodError } from '@/utils/validation';
import { z } from 'zod';

// Schema for creating role
const RoleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Schema for updating role
const RoleUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Schema for assigning permissions to role
const AssignPermissionsSchema = z.object({
  roleId: z.string(),
  permissionIds: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    // Only admin can list roles
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
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Fetch roles with permissions populated
    const roles = await Role.find(query)
      .populate('permissions')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Role.countDocuments(query);
    
    return NextResponse.json(
      { 
        success: true,
        roles,
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
    console.error('Roles list error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin can create roles
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = RoleCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, description } = validation.data;
    
    // Check if role with this name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: 'Role with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new role
    const role = new Role({
      name,
      description,
    });
    
    await role.save();
    
    // Populate permissions for response
    await role.populate('permissions');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Role created successfully',
        role: {
          id: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Role creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Only admin can update roles
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = RoleUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { id, name, description } = body;
    
    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Check if another role with this name already exists
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return NextResponse.json(
          { success: false, message: 'Role with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update role fields
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    
    await role.save();
    
    // Populate permissions for response
    await role.populate('permissions');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Role updated successfully',
        role: {
          id: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating the role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only admin can delete roles
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { id } = body;
    
    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Delete role
    await Role.findByIdAndDelete(id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Role deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Role deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while deleting the role' },
      { status: 500 }
    );
  }
}

// Assign permissions to role
export async function PATCH(request: NextRequest) {
  try {
    // Only admin can assign permissions to roles
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = AssignPermissionsSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { roleId, permissionIds } = validation.data;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Check if all permissions exist
    const permissions = await Permission.find({
      _id: { $in: permissionIds }
    });
    
    if (permissions.length !== permissionIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more permissions not found' },
        { status: 404 }
      );
    }
    
    // Assign permissions to role
    role.permissions = permissionIds;
    await role.save();
    
    // Populate permissions for response
    await role.populate('permissions');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permissions assigned to role successfully',
        role: {
          id: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign permissions to role error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while assigning permissions to role' },
      { status: 500 }
    );
  }
}