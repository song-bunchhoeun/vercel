'use client';

import BaseForm from '@/components/BaseForm/BaseForm';
import { useCallback, useState } from 'react';
import { DateRange } from 'react-day-picker';
import z from 'zod';
import { OverviewHeader } from './_components/OverviewHeader';
import { RankingTables } from './_components/RankingTables';
import { StatCards } from './_components/StatCards';
import MapProvider from '@/components/MapLayout/MapProvider';
import BusinessInsights from '@/app/dashboard/overview/_components/BusinessInsights';

const overviewSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    warehouseId: z.string().optional(),
    timeRange: z.string().optional()
});

export default function OverviewPage() {
    const [filters, setFilters] = useState<{
        timeRange?: string;
        warehouse?: string;
        dateRange?: DateRange;
        fromDate?: string;
        toDate?: string;
        warehouseIds?: string[] | null;
    }>({
        timeRange: '24h',
        warehouse: 'all',
        fromDate: '',
        toDate: '',
        warehouseIds: null
    });

    const handleFilterChange = useCallback(
        (newFilters: {
            timeRange?: string;
            warehouse?: string;
            dateRange?: DateRange;
            fromDate?: string;
            toDate?: string;
            warehouseIds?: string[] | null;
        }) => {
            console.log('Filters updated:', newFilters);
            setFilters(newFilters);
        },
        []
    );

    return (
        <BaseForm
            schema={overviewSchema}
            defaultValues={{
                searchText: '',
                fromDate: '',
                toDate: '',
                warehouseId: 'all',
                timeRange: '24h'
            }}
            // onChange={(data) => console.log('Form data updated:', data)}
        >
            <main className="flex flex-col gap-6 px-10 py-6">
                <OverviewHeader onFilterChange={handleFilterChange} />

                <StatCards
                    fromDate={filters.fromDate}
                    toDate={filters.toDate}
                    warehouseIds={filters.warehouseIds}
                />

                <RankingTables
                    fromDate={filters.fromDate}
                    toDate={filters.toDate}
                    warehouseIds={filters.warehouseIds}
                />

                {/* Uncomment when BusinessInsights is ready */}
                <MapProvider>
                    <BusinessInsights
                        fromDate={filters.fromDate}
                        toDate={filters.toDate}
                    />
                </MapProvider>
            </main>
        </BaseForm>
    );
}
