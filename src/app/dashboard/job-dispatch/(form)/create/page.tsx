import { Suspense } from 'react';
import JobDispatchCreateComponent from './create-page';
import MapProvider from '@/components/MapLayout/MapProvider';

export default function JobDispatchCreationPage() {
    return (
        <Suspense>
            <MapProvider>
                <JobDispatchCreateComponent />
            </MapProvider>
        </Suspense>
    );
}
