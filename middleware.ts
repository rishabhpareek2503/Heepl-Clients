import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password']

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // For now, let the client-side handle authentication
  // This prevents middleware from interfering with the auth flow
  // In production, you would verify Firebase tokens here
  
  // For root path, redirect to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
