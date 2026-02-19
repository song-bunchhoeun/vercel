'use client';

import ShipmentForm from '@/app/dashboard/shipments/(form)/shipment.form';
import Toast from '@/components/common/toast/Toast';
import { useCreateShipment } from '@/hooks/useShipments';
import { ParcelRequestBody } from '@/models/request.model';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { shipmentDefaultValues } from '../shipment.form.service';

const ShipmentCreationPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mutate: createShipment, isPending } = useCreateShipment();

    const handleFormSubmit = (payload: ParcelRequestBody) => {
        createShipment(payload, {
            onSuccess: () => {
                toast.custom((tId) => (
                    <Toast
                        toastId={tId}
                        status="success"
                        description={t('shipments.messages.create_success')}
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

    return (
        <ShipmentForm
            onFormValid={handleFormSubmit}
            shipment={shipmentDefaultValues}
            isPending={isPending}
        />
    );
};

export default ShipmentCreationPage;
