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
  
  // Add user info to request headers for use in route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decoded.userId);
  requestHeaders.set('x-user-role', decoded.role);
  
  // Create a new request with the updated headers
  const newRequest = new NextRequest(request, {
    headers: requestHeaders,
  });
  
  return { request: newRequest, user: decoded };
}

export async function withRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await withAuth(request);
  
  // If withAuth returned a response, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return authResult;
}