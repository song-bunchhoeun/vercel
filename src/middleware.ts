// middleware.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
    '/',
    '/login',
    '/session-expired',
    '/api/auth',
    '/api/logout',
    '/api/health',
    '/not-found',
    '/no-access',
    '/no-permission',
    '/theme-audit'
];

function isPublicFile(pathname: string) {
    if (
        [
            '/favicon.ico',
            '/robots.txt',
            '/sitemap.xml',
            '/manifest.webmanifest'
        ].includes(pathname)
    ) {
        return true;
    }
    return /\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|txt|xml|json|woff2?|ttf|eot|mp4|pdf|geojson|xlsx)$/i.test(
        pathname
    );
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Instant pass for internals and static assets
    if (pathname.startsWith('/_next') || isPublicFile(pathname)) {
        return NextResponse.next();
    }

    // 2. Fetch Session
    const session = await auth();

    // ✅ REFINED SOURCE OF TRUTH
    const hasToken = !!session?.accessToken;
    const hasError = !!session?.error;
    const isValidSession = hasToken && !hasError;

    // 3. BREAK THE REDIRECT LOOP (Critical Fix)
    // If the user is on a public path (like /login), don't perform protected checks.
    const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    );

    if (isPublic) {
        // 🚀 If valid session hits /login, go to dashboard
        if (isValidSession && pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        // 🚀 If it's public (like /login or /), just let them through
        return NextResponse.next();
    }

    /**
     * 4. PROTECTED PATH LOGIC
     * If we got here, the path is NOT public.
     * If the session is invalid, force them to login.
     */
    if (!isValidSession) {
        const loginUrl = new URL('/login', req.url);

        // Expert Tip: Pass the attempted URL as a callback for better UX
        loginUrl.searchParams.set('callbackUrl', pathname);

        // If there was a specific error, tell the login page why
        if (hasError) {
            loginUrl.searchParams.set('error', session.error!);
        }

        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
};
