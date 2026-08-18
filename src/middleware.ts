import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const protectedPaths = ["/dashboard"]
const adminPaths = ["/admin"]
const DEVICE_COOKIE = "ib_device"
const DEVICE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionCookie(request)

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p))

  if ((isProtected || isAdmin) && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname))
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/flipbook") {
    // Assign a long-lived device id so the page below can enforce the
    // per-purchase device cap. Forwarded via a request header too, since a
    // cookie set here only reaches the browser on the *next* request.
    let deviceId = request.cookies.get(DEVICE_COOKIE)?.value
    const requestHeaders = new Headers(request.headers)
    if (!deviceId) deviceId = crypto.randomUUID()
    requestHeaders.set("x-device-id", deviceId)

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEVICE_COOKIE_MAX_AGE_S,
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
}
