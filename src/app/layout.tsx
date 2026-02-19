import AnalyticsBridgeWrapper from '@/components/Analytics/AnalyticsBridge';
import { cn } from '@/lib/utils';
import { ClientProviders } from '@/providers';
import { Viewport } from 'next';
import { Inter, Kantumruy_Pro } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
    variable: '--font-inter-sans',
    subsets: ['latin']
});

const kantumruyPro = Kantumruy_Pro({
    variable: '--font-kantumruy-pro',
    subsets: ['khmer']
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
    // Also supported but less commonly used
    // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={cn(
                    inter.variable,
                    kantumruyPro.variable,
                    'font-sans antialiased overflow-hidden'
                )}
            >
                <Script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.LMD_GTAG_ID}`}
                />

                <Script id="ga4-init" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${process.env.LMD_GTAG_ID}');
                    `}
                </Script>
                <AnalyticsBridgeWrapper />
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
