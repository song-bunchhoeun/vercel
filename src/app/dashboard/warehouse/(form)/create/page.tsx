'use client';

import Toast from '@/components/common/toast/Toast';
import { useCreateWarehouse } from '@/hooks/useWarehouses';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import WarehouseForm from '../warehouse.form';
import { warehouseDefaultValues } from '../warehouse.form.service';

const WarehouseCreationPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mutate, isPending } = useCreateWarehouse();

    // Track server-side validation errors for specific fields
    // const [serverErrors, setServerErrors] = useState<{ name?: string }>({});

    const onFormValid = useCallback(
        (newFormData: FormData) => {
            // Clear previous errors before a new attempt
            // setServerErrors({});

            mutate(newFormData, {
                onSuccess: () => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description={t('warehouses.form.create_success')}
                        />
                    ));
                    // Redirect back to the list after success
                    router.push('/dashboard/warehouse');
                },
                //eslint-disable-next-line
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        t('warehouses.form.create_error');

                    // Better error mapping
                    if (message.toLowerCase().includes('name')) {
                        // setServerErrors({ name: message });
                    }

                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="failed"
                            description={message}
                        />
                    ));
                }
            });
        },
        [mutate, router, t]
    );

    return (
        <WarehouseForm
            onFormValid={onFormValid}
            warehouse={warehouseDefaultValues}
            isLoading={isPending} // Pass the loading state to disable buttons
            // externalErrors={serverErrors} // Pass server-side errors to the form
        />
    );
};

export default WarehouseCreationPage;
