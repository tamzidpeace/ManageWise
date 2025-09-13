import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  const authResult = await withRole(request, ['admin']);
  
  // If withRole returned a response, it means authentication or authorization failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  return NextResponse.json(
    { 
      success: true, 
      message: 'Admin-only request successful',
      user: {
        id: user.userId,
        email: user.email,
        role: user.roles,
      }
    },
    { status: 200 }
  );
}