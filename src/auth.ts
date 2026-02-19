// src/auth.ts
import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import type { JWT } from 'next-auth/jwt';

export const { auth, handlers, signIn, signOut } = NextAuth({
    /**
     * Stateless by design
     */
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days session = refreshToken lifespan, not accessToken
        updateAge: 24 * 60 * 60 // (Optional) How often the session should write to the database/cookie
    },

    cookies: {
        sessionToken: {
            name:
                process.env.NODE_ENV === 'production'
                    ? '__Secure-authjs.session-token'
                    : 'authjs.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },

    debug: process.env.NODE_ENV === 'development',

    pages: {
        signIn: '/login',
        error: '/no-access'
    },

    providers: [
        Keycloak({
            clientId: process.env.AUTH_KEYCLOAK_CLIENT_ID!,
            issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
            clientSecret: '',
            checks: ['pkce'],
            client: {
                token_endpoint_auth_method: 'none'
            },
            authorization: {
                params: {
                    scope: process.env.KEYCLOAK_SCOPES!,
                    orig_redirect_uri:
                        process.env.AUTH_KEYCLOAK_ISSUER! +
                        process.env.KEYCLOAK_ORIG_REDIRECT_URI!
                }
            }
        })
    ],

    callbacks: {
        async signIn({ account }) {
            if (!account?.access_token) return false;

            try {
                const params = new URLSearchParams({
                    'api-version': process.env.LMD_API_VERSION || '1.0'
                });

                const url = `${process.env.LMD_API_BASE_URL}/users/profile?${params.toString()}`;

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${account.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.error(
                        'User not authorized in Next Backend:',
                        response.status
                    );
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Authorization check failed:', error);
                return false;
            }
        },

        async jwt({ token, account }) {
            /**
             * 1️⃣ Initial login
             */
            if (account) {
                const now = Math.floor(Date.now() / 1000);
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    idToken: account.id_token,
                    expiresAt: account.expires_at, // seconds since epoch from KC
                    // Capture refresh token lifespan from Keycloak
                    refreshTokenExpiresAt:
                        now + (account.refresh_expires_in as number)
                } as JWT;
            }

            /**
             * 2️⃣ Source of Truth Check
             * If current time is past KC expiry (with 10s buffer)
             */
            const nowInSeconds = Math.floor(Date.now() / 1000);
            if (
                token.expiresAt &&
                nowInSeconds < (token.expiresAt as number) - 10
            ) {
                return token;
            }

            /**
             * 3️⃣ Token expired or in buffer zone → refresh
             */
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string | undefined;
            session.idToken = token.idToken as string | undefined;
            session.error = token.error as string | undefined;
            session.expiresAt = token.expiresAt as number | undefined;
            // Expose refresh expiry to SessionGuard
            session.refreshExpiresAt = token.refreshTokenExpiresAt as
                | number
                | undefined;
            return session;
        },

        /**
         * Middleware-level protection
         */
        authorized({ auth, request }) {
            // ✅ FIX: A session is only valid if it has a token AND no refresh errors
            const isLoggedIn = !!auth?.accessToken && !auth?.error;
            const isProtected =
                request.nextUrl.pathname.startsWith('/dashboard');

            if (isProtected && !isLoggedIn) {
                return false;
            }

            return true;
        }
    }
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const response = await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: process.env.AUTH_KEYCLOAK_CLIENT_ID!,
                    refresh_token: token.refreshToken as string
                })
            }
        );

        const refreshed = await response.json();

        if (!response.ok) {
            throw refreshed;
        }

        const now = Math.floor(Date.now() / 1000);
        return {
            ...token,
            accessToken: refreshed.access_token,
            expiresAt: now + refreshed.expires_in,
            refreshToken: refreshed.refresh_token ?? token.refreshToken,
            // Update refresh expiry if Keycloak provides a new one (sliding window)
            refreshTokenExpiresAt: refreshed.refresh_expires_in
                ? now + refreshed.refresh_expires_in
                : token.refreshTokenExpiresAt
        };
    } catch (error) {
        console.error('Refresh token failed', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError'
        };
    }
}
