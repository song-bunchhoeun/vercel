import { Suspense } from 'react';
import { ParcelMissingList } from './ParcelMisingList';

export default function ParcelMissingListPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <ParcelMissingList />
        </Suspense>
    );
}
