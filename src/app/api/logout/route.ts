import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST() {
    const session = await auth();

    const idToken = session?.idToken;
    if (!idToken) {
        return NextResponse.json(
            { message: 'No id_token in session' },
            { status: 400 }
        );
    }

    const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
    const clientId = process.env.AUTH_KEYCLOAK_CLIENT_ID!;

    const form = new URLSearchParams();
    form.set('client_id', clientId);
    form.set('id_token_hint', idToken);

    const res = await fetch(`${issuer}/protocol/openid-connect/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form.toString() // 🔑 critical
    });

    // Keycloak usually returns 204 on success
    if (![200, 204, 302].includes(res.status)) {
        const text = await res.text();
        return NextResponse.json(
            { message: 'Keycloak logout failed', detail: text },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
