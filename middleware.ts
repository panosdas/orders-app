import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "./lib/session"

const PUBLIC_PATHS = ["/login"]
const PUBLIC_FILE = /\.[^/]+$/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname)

  // Allow the browser to fetch PWA/static assets without an active session.
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.isLoggedIn) {
    if (isPublic) return response
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Sliding session — re-save to extend the 1-day window on every request
  await session.save()

  if (isPublic) {
    const redirectTo = session.role === "service" ? "/waiter" : "/"
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/auth|api/).*)"],
}
