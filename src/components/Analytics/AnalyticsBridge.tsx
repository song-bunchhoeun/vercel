'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGAEvent } from '@/hooks/useGAEvent';

function AnalyticsBridge() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { sendEvent } = useGAEvent();

    useEffect(() => {
        // 1. Tracks every page hit (Public/Anonymized)
        // GA4 automatically tracks page views, but this manual event
        // allows you to add custom parameters for your "Visit" metric.
        sendEvent('portal_public_visit', {
            path: pathname,
            search: searchParams.toString(),
            timestamp: new Date().toISOString()
        });
    }, [pathname, searchParams, sendEvent]);

    return null; // This component has no UI
}

export default function AnalyticsBridgeWrapper() {
    return (
        <Suspense>
            <AnalyticsBridge />
        </Suspense>
    );
}
