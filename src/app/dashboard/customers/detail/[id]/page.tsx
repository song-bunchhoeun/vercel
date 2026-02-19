import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import CustomerDetail from './CustomerDetail';

const CustomerDetailPage = () => {
    return (
        <Suspense
            fallback={
                <div className="p-10 text-center">
                    <Loader2 className="animate-spin inline mr-2" /> Loading
                    History...
                </div>
            }
        >
            <CustomerDetail />
        </Suspense>
    );
};

export default CustomerDetailPage;
