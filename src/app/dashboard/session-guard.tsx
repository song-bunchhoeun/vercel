'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGetUserProfile } from '@/hooks/useUsers';

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const { data: profile, error, isLoading, isError } = useGetUserProfile();

    useEffect(() => {
        if (sessionStatus === 'loading' || isLoading) return;

        if (sessionStatus === 'authenticated') {
            const errorStatus =
                //eslint-disable-next-line
                (error as any)?.response?.status || (error as any)?.statusCode;

            /**
             * 🛡️ TERMINAL SESSION CHECK
             * We only redirect if the REFRESH token (the 24h session) is dead.
             * We ignore isClockExpired (the 5m access token) because auth.ts refreshes it automatically.
             */
            const isRefreshFailed =
                session?.error === 'RefreshAccessTokenError';

            const now = Math.floor(Date.now() / 1000);
            const isSessionDead =
                session?.refreshExpiresAt &&
                now >= (session.refreshExpiresAt as number);

            // If the API still returns 401, it means the session is unrecoverable.
            const isApiUnauthorized = isError && errorStatus === 401;

            if (isRefreshFailed || isSessionDead || isApiUnauthorized) {
                signOut({ redirect: false }).then(() => {
                    router.replace('/session-expired');
                });
                return;
            }

            /**
             * 5: 403 FORBIDDEN (Authorization Issues)
             */
            if (isError && errorStatus === 403) {
                router.replace('/no-permission');
                return;
            }

            /**
             * 4: NO ACCESS (Identity exists in KC but not in our App DB)
             */
            if (!profile && !isLoading) {
                router.replace('/no-access');
            }
        }
    }, [sessionStatus, session, router, profile, error, isLoading, isError]);

    if (
        sessionStatus === 'loading' ||
        (sessionStatus === 'authenticated' && isLoading)
    ) {
        return null;
    }

    return <>{children}</>;
}
