import { Suspense } from 'react';
import { DriverList } from './DriverList';
import { t } from 'i18next';

export default function DriverListPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8">
                    {t('drivers.list_page.empty_state.loading')}
                </div>
            }
        >
            <DriverList />
        </Suspense>
    );
}
