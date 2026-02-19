'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import NextTopLoader from 'nextjs-toploader';

export default function I18nProvider({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <I18nextProvider i18n={i18n}>
            <NextTopLoader
                color="var(--primary)" // Tailwind blue-600
                initialPosition={0.3}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
            />
            {children}
        </I18nextProvider>
    );
}
