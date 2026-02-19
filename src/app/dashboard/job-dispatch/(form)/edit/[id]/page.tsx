import { Suspense } from 'react';
import MapProvider from '@/components/MapLayout/MapProvider';
import JobDispatchEditComponent from './edit-page';

export default function JobDispatchEditPage() {
    return (
        <Suspense>
            <MapProvider>
                <JobDispatchEditComponent />
            </MapProvider>
        </Suspense>
    );
}
