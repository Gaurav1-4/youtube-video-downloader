import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all routes by default, except webhook routes or public API if needed.
// For now, everything is protected.
const isProtectedRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)", "/__clerk/:path*"],
};
