'use client';

import dynamic from 'next/dynamic';

const MapProvider = dynamic(
    () => import('@/components/MapLayout/MapProvider'),
    {
        ssr: false
    }
);
const MapPanel = dynamic(() => import('@/components/MapLayout/MapPanel'), {
    ssr: false
});

interface ZoneLayoutProps {
    children: React.ReactNode;
}

export default function ZoneLayout({ children }: ZoneLayoutProps) {
    return (
        <MapProvider>
            <div className="flex max-h-full flex-[1_1_auto]">
                <div className="w-5/12 flex">{children}</div>

                <MapPanel />
            </div>
        </MapProvider>
    );
}
