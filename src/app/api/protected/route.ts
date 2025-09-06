import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  
  // If withAuth returned a response, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  return NextResponse.json(
    { 
      success: true, 
      message: 'Authenticated request successful',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      }
    },
    { status: 200 }
  );
}