'use client';

import Toast from '@/components/common/toast/Toast';
import {
    useGetWarehouseDetail,
    useUpdateWarehouse
} from '@/hooks/useWarehouses';
import { useRouter } from 'next/navigation';
import { use, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import WarehouseForm from '../../warehouse.form';
import { WarehouseFormData } from '../../warehouse.form.service';

const WarehouseEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { t } = useTranslation();
    const { id } = use(params);
    const router = useRouter();

    // 1. Fetch data
    const { data: warehouse, isLoading: isFetching } =
        useGetWarehouseDetail(id);
    const { mutate, isPending: isUpdating } = useUpdateWarehouse(id);

    // 2. Map API data to Form Schema
    const formValues: WarehouseFormData = useMemo(() => {
        if (!warehouse) {
            return {
                name: '',
                address: '',
                latitude: null, // Use null as discussed in our schema refactor
                longitude: null,
                primaryPhone: '',
                secondaryPhone: '',
                status: 1
            };
        }

        return {
            id: warehouse.id,
            name: warehouse.name ?? '',
            address: warehouse.address ?? '',
            latitude: warehouse.latitude ?? null,
            longitude: warehouse.longitude ?? null,
            primaryPhone: warehouse.primaryPhone ?? '',
            secondaryPhone: warehouse.secondaryPhone ?? '',
            status: warehouse.status ?? 1,
            documents: warehouse.documents ?? []
        };
    }, [warehouse]);

    const onFormValid = (newFormData: FormData) => {
        mutate(newFormData, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t('warehouses.form.edit_success')}
                    />
                ));
                // 3. Navigate back to list after successful edit
                router.push('/dashboard/warehouse');
            },
            //eslint-disable-next-line
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ??
                    error?.message ??
                    t('warehouses.form.edit_error');

                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={message}
                    />
                ));
            }
        });
    };

    // 4. Handle initial loading state
    if (isFetching) {
        return (
            <div className="p-8 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">
                    {t('warehouses.form.loading')}
                </p>
            </div>
        );
    }

    return (
        <WarehouseForm
            onFormValid={onFormValid}
            warehouse={formValues}
            isEdit
            isLoading={isUpdating}
        />
    );
};

export default WarehouseEditPage;
