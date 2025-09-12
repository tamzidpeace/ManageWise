import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Role from '@/models/Role';
import { withPermission } from '@/lib/authMiddleware';
import { handleZodError } from '@/utils/validation';
import { z } from 'zod';

const AssignRolesSchema = z.object({
  roles: z.array(z.string()),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await withPermission(request, 'users.assign_roles');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = AssignRolesSchema.safeParse(body);

    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { roles: roleIds } = validation.data;

    const roles = await Role.find({ _id: { $in: roleIds } });
    if (roles.length !== roleIds.length) {
      return NextResponse.json({ success: false, message: 'One or more roles not found' }, { status: 400 });
    }

    user.roles = roleIds;
    await user.save();

    await user.populate('roles');

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Assign roles error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while assigning roles' }, { status: 500 });
  }
}
