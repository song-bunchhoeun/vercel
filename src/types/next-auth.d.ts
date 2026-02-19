import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        idToken?: string;
        error?: string;
        expiresAt?: number;
        refreshExpiresAt?: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        accessToken?: string;
        refreshToken?: string;
        idToken?: string;
        expiresAt?: number;
        error?: string;
    }
}
