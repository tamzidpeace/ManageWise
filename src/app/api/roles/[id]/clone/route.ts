import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Role from '@/models/Role';
import { withPermission } from '@/lib/authMiddleware';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, 'roles.create');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const originalRole = await Role.findById(params.id);
    if (!originalRole) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    let newRoleName = `Copy of ${originalRole.name}`;
    let counter = 1;
    while (await Role.findOne({ name: newRoleName })) {
      newRoleName = `Copy of ${originalRole.name} (${counter++})`;
    }

    const newRole = new Role({
      name: newRoleName,
      description: originalRole.description,
      permissions: originalRole.permissions,
    });

    await newRole.save();

    await newRole.populate('permissions');

    return NextResponse.json({ success: true, role: newRole }, { status: 201 });

  } catch (error) {
    console.error('Clone role error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while cloning the role' }, { status: 500 });
  }
}
