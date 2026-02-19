// src/app/api/proxy/[...path]/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const API_BASE = process.env.LMD_API_BASE_URL!;
const API_VERSION = process.env.LMD_API_VERSION!;

/**
 * Strip hop-by-hop + sensitive headers (don’t forward these from upstream).
 * Ref: RFC 7230 hop-by-hop headers.
 */
function filterUpstreamHeaders(upstream: Headers) {
    const out = new Headers();

    const BLOCKED = new Set([
        'connection',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',

        // avoid mismatches / sensitive propagation
        'content-length',
        'set-cookie'
    ]);

    upstream.forEach((value, key) => {
        const k = key.toLowerCase();
        if (!BLOCKED.has(k)) out.set(key, value);
    });

    return out;
}

async function handler(
    req: Request,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;

    const session = await auth();
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const targetUrl = new URL(`${API_BASE}/${path.join('/')}`);

    // copy query params
    const incomingUrl = new URL(req.url);
    incomingUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
    });

    // inject api-version server-side
    targetUrl.searchParams.set('api-version', API_VERSION);

    /**
     * 🔒 REQUEST HEADERS (allowlist)
     */
    const headers = new Headers();
    const ALLOWED_HEADERS = [
        'accept',
        'content-type',
        'if-none-match',
        'if-modified-since',
        'range'
    ];

    for (const h of ALLOWED_HEADERS) {
        const v = req.headers.get(h);
        if (v) headers.set(h, v);
    }

    headers.set('authorization', `Bearer ${session.accessToken}`);

    /**
     * ⏱️ TIMEOUT
     */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s

    try {
        const res = await fetch(targetUrl.toString(), {
            method: req.method,
            headers,
            signal: controller.signal,
            redirect: 'manual', // IMPORTANT: do not follow upstream redirects
            body:
                req.method === 'GET' || req.method === 'HEAD'
                    ? undefined
                    : await req.arrayBuffer()
        });

        /**
         * ✅ PASS-THROUGH RESPONSE (status + body), FE handles errors
         */
        const responseHeaders = filterUpstreamHeaders(res.headers);

        return new NextResponse(res.body, {
            status: res.status,
            headers: responseHeaders
        });
        //eslint-disable-next-line
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            return NextResponse.json(
                { message: 'Upstream timeout' },
                { status: 504 }
            );
        }

        // network/DNS/TLS/etc. errors still need a response
        return NextResponse.json(
            { message: 'Upstream fetch failed' },
            { status: 502 }
        );
    } finally {
        clearTimeout(timeout);
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
