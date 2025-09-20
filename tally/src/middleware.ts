import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // The middleware will only run for the paths specified in the matcher
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}