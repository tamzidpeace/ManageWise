import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/auth';

// Define paths that don't require authentication
const publicPaths = ['/login', '/register'];

// Define paths for each role
const adminPaths = ['/admin'];
const cashierPaths = ['/cashier'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // If no token and not a public path, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the token
    const payload = await verifyToken(token);
    
    if (!payload) {
      // If token verification fails, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user is trying to access admin paths
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
    if (isAdminPath && payload.role !== 'admin') {
      // Redirect to appropriate dashboard
      const redirectPath = payload.role === 'cashier' ? '/cashier/dashboard' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // Check if user is trying to access cashier paths
    const isCashierPath = cashierPaths.some(path => pathname.startsWith(path));
    if (isCashierPath && payload.role !== 'cashier') {
      // Redirect to appropriate dashboard
      const redirectPath = payload.role === 'admin' ? '/admin/dashboard' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // If everything is fine, continue
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/cashier/:path*',
    '/login',
    '/register',
  ],
};