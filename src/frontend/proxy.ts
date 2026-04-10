import { ProxyConfig, NextRequest, NextResponse } from "next/server";

// COOKIE MOCK — how cookies work in Next.js middleware

// Reading a cookie:
//   const cookie = request.cookies.get('token')  → { name, value } | undefined
//
// Setting a cookie on the response:
//   const res = NextResponse.next()
//   res.cookies.set('token', 'value', { httpOnly: true, secure: true, path: '/' })
//
// Deleting a cookie:
//   const res = NextResponse.redirect(url)
//   res.cookies.delete('token')

const publicRoutes = [
    { path: "/",         whenAuthenticated: null       },
    { path: "/login",    whenAuthenticated: "redirect" },
    { path: "/register", whenAuthenticated: "redirect" },
] as const;

type PublicRoute = typeof publicRoutes[number];

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login";
const REDIRECT_WHEN_AUTHENTICATED     = "/dashboard";

async function verifyJwt(token: string): Promise<Record<string, unknown> | null> {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split(".");
        if (!headerB64 || !payloadB64 || !signatureB64) return null;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not set");

        const keyData = new TextEncoder().encode(secret);
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signature = Uint8Array.from(
            atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
            (c) => c.charCodeAt(0)
        );
        const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

        const valid = await crypto.subtle.verify("HMAC", cryptoKey, signature, data);
        if (!valid) return null;

        const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));

        // Check expiry
        if (payload.exp && Date.now() / 1000 > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const publicRoute = publicRoutes.find((r) => r.path === pathname) as PublicRoute | undefined;
    const tokenCookie = request.cookies.get("token");

    if (!tokenCookie) {
        if (publicRoute) return NextResponse.next();
        return NextResponse.redirect(new URL(REDIRECT_WHEN_NOT_AUTHENTICATED, request.url));
    }

    const payload = await verifyJwt(tokenCookie.value);

    if (!payload) {
        const response = NextResponse.redirect(new URL(REDIRECT_WHEN_NOT_AUTHENTICATED, request.url));
        response.cookies.delete("token");
        return response;
    }

    if (publicRoute?.whenAuthenticated === "redirect") {
        return NextResponse.redirect(new URL(REDIRECT_WHEN_AUTHENTICATED, request.url));
    }

    return NextResponse.next();
}

export const config: ProxyConfig = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};