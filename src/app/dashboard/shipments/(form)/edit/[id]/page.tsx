'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useMemo } from 'react';
import { toast } from 'sonner';

import ShipmentForm from '@/app/dashboard/shipments/(form)/shipment.form';
import Toast from '@/components/common/toast/Toast';
import { useGetShipmentDetail, useUpdateShipment } from '@/hooks/useShipments';
import { ParcelRequestBody } from '@/models/request.model';
import { useTranslation } from 'react-i18next';
import { ShipmentFormModel } from '../../shipment.form.service';

interface EditPageProps {
    params: Promise<{ id: string }>;
}

const ShipmentEditPage = ({ params }: EditPageProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { id: selectedId } = use(params);

    // 1. Hooks
    const { data: apiShipment, isLoading } = useGetShipmentDetail(selectedId);
    const { mutate: updateShipment, isPending: isUpdating } =
        useUpdateShipment(selectedId);

    // 2. Map API response to the correct Form Model (Nested Address)
    const initialValues: ShipmentFormModel | null = useMemo(() => {
        if (!apiShipment) return null;
        const shipment = apiShipment;

        return {
            customer: {
                id: shipment.customer?.id || '',
                name: shipment.customer?.name ?? '',
                primaryPhone: shipment.customer?.primaryPhone ?? '',
                secondaryPhone: shipment.customer?.secondaryPhone ?? '',
                address: {
                    // 🎯 FIX: Use addressId to match the Customer's address list IDs
                    addressId: shipment.address?.addressId ?? '',
                    label: shipment.address?.label ?? '',
                    line: shipment.address?.line ?? '',
                    latitude: shipment.address?.latitude || 11.5564,
                    longitude: shipment.address?.longitude || 104.9282
                }
            },
            qty: shipment.item?.qty.toString() ?? '1',
            amount: shipment.item?.amount.toString() ?? '0',
            taskType: shipment.taskType,
            currency: shipment.item?.currencyType,
            warehouseId: shipment.warehouseId ?? '',
            note: shipment.note ?? ''
        };
    }, [apiShipment]);

    const handleFormSubmit = (payload: ParcelRequestBody) => {
        updateShipment(payload, {
            onSuccess: () => {
                toast.custom((tId) => (
                    <Toast
                        toastId={tId}
                        status="success"
                        description={t('shipments.messages.update_success')}
                    />
                ));
                router.push('/dashboard/shipments');
            },
            //eslint-disable-next-line
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    t('shipments.messages.error_save');
                toast.custom((tId) => (
                    <Toast
                        toastId={tId}
                        status="failed"
                        description={message}
                    />
                ));
            }
        });
    };

    if (isLoading || !initialValues) {
        return (
            <div className="flex h-100 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ShipmentForm
            onFormValid={handleFormSubmit}
            shipment={initialValues}
            isEdit
            isPending={isUpdating}
        />
    );
};

export default ShipmentEditPage;
