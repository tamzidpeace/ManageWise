import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/utils/jwt';

export async function withAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
  
  return { user: decoded };
}

export async function withRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await withAuth(request);
  
  // If withAuth returned a response, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;

  console.log('roles', allowedRoles, user);
  
  
  // Check if user has at least one of the allowed roles
  const hasPermission = user.roles.some(role => allowedRoles.includes(role));
  
  if (!hasPermission) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return authResult;
}

export async function withPermission(request: NextRequest, requiredPermission: string) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!user.permissions) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  const hasPermission = user.permissions.some(permission => {
    if (permission.endsWith('.*')) {
      return requiredPermission.startsWith(permission.slice(0, -2));
    }
    return permission === requiredPermission;
  });

  if (!hasPermission) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return authResult;
}