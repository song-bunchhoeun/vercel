'use client';

import { signIn } from 'next-auth/react';

export default function SessionExpiredPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-lg font-semibold">Session expired</h1>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                Your login session has expired for security reasons. Please sign
                in again to continue.
            </p>

            <button
                onClick={() => signIn('keycloak', { redirectTo: '/dashboard' })}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground cursor-pointer"
            >
                Sign in again
            </button>
        </div>
    );
}
