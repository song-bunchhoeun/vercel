import { Suspense } from 'react';
import { WarehouseList } from './WarehouseList'; // Import your client component
import { Loader2 } from 'lucide-react';

export default function WarehouseListPage() {
    return (
        // Providing a fallback is mandatory to clear the warning properly
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="animate-spin text-primary" />
                    <span className="ml-2">Loading Warehouse Module...</span>
                </div>
            }
        >
            <WarehouseList />
        </Suspense>
    );
}
