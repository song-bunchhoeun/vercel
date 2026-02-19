import { Suspense } from 'react';
import { ShipmentList } from './ShipmentList';

export default function ShipmentListPage() {
    return (
        <Suspense>
            <ShipmentList />
        </Suspense>
    );
}
