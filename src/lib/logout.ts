'use client';

import { signOut } from 'next-auth/react';

export async function logout() {
    try {
        const res = await fetch('/api/logout', { method: 'POST' });

        if (!res.ok) {
            const error = await res.json().catch(() => null);
            console.error('Logout API failed:', error);
            return;

            // Optional: show toast / alert
            // toast.error('Failed to logout from SSO. Logging out locally.');
        }

        await signOut({ redirect: false });
        window.location.href = '/dashboard';
    } catch (err) {
        console.error('Logout request error:', err);
        // Optional: show toast / alert
    }
}
