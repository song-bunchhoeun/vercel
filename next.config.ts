// next.config.ts
import nextBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = nextBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'stnoneprodlmdsea01.blob.core.windows.net' // Wildcard for subdomains,
            },
            {
                protocol: 'https',
                hostname: 'lmdstdev.blob.core.windows.net'
            },
            {
                protocol: 'https',
                hostname: 'stuatlmdsea01.blob.core.windows.net'
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/dashboard/overview',
                permanent: true
            }
        ];
    }
};

export default withBundleAnalyzer(nextConfig);
