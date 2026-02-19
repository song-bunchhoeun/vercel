'use client';

import { ReactNode } from 'react';

export function JobDispatchCard({ cardContent }: { cardContent: ReactNode }) {
    return (
        <div className="overflow-y-auto overflow-x-hidden pl-1 pr-4 custom-scrollbar max-h-[calc(100vh-310px)] w-full">
            {cardContent}
        </div>
    );
}
