'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ReactQueryProvider from './ReactQueryProvider';
import { SessionProvider } from './SessionProvider';

// 🔥 The "Memory Saver": SSR: false keeps i18n out of the build worker's heap
const I18nProvider = dynamic(() => import('./I18nProvider'), {
    ssr: false
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ReactQueryProvider>
                <I18nProvider>{children}</I18nProvider>
            </ReactQueryProvider>
        </SessionProvider>
    );
}
