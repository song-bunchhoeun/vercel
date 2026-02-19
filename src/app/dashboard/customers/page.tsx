import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { CustomerList } from './CustomerList';

export default function CustomerListPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-full items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            }
        >
            <CustomerList />
        </Suspense>
    );
}
