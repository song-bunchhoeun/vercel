import { Suspense } from 'react';
import { JobDispatchListContent } from './JobDispatchList';
import MapProvider from '@/components/MapLayout/MapProvider';

export default function JobDispatchListPage() {
    return (
        <Suspense>
            <MapProvider>
                <JobDispatchListContent />
            </MapProvider>
        </Suspense>
    );
}
