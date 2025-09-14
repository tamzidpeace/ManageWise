import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Role from '@/models/Role';
import { withPermission } from '@/lib/authMiddleware';
import { Permissions } from '@/schemas/permissions';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, Permissions.ROLES_VIEW);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    // Find role by ID and populate permissions
    const role = await Role.findById((await params).id).populate('permissions');
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        role: {
          id: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isActive: role.isActive,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Role fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching the role' },
      { status: 500 }
    );
  }
}