'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DriverForm from '@/app/dashboard/driver/(form)/driver.form';
import {
    driverDefaultValues,
    DriverRequestData // Renamed from DriverFormData for consistency
} from '@/app/dashboard/driver/(form)/driver.form.service';
import Toast from '@/components/common/toast/Toast';
import QRGeneratDialog from '@/components/QRCode/QRGenerateDialog';
import { useCreateDriver } from '@/hooks/useDrivers'; // Corrected hook name
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DriverCreationPage = () => {
    const { mutate, isPending } = useCreateDriver();
    const router = useRouter();
    const { t } = useTranslation();

    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [qrLink, setQrLink] = useState('');

    const onFormValid = useCallback(
        (formData: DriverRequestData) => {
            const newFormData = new FormData();

            // 1. Dynamic FormData Mapping
            Object.entries(formData).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '')
                    return;

                if (key === 'photo' && value instanceof File) {
                    newFormData.append('photo', value);
                } else if (key === 'profileUrl') {
                    return; // Skip frontend-only preview strings
                } else {
                    newFormData.append(key, String(value));
                }
            });

            mutate(newFormData, {
                onSuccess: (res) => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description={t('drivers.messages.create_success')}
                        />
                    ));

                    const dynamicUrl = res?.data?.dynamicActiveurl;
                    if (dynamicUrl) {
                        setQrLink(dynamicUrl);
                        setOpenQrDialog(true);
                    } else {
                        router.push('/dashboard/driver');
                    }
                },
                onError: (error: unknown) => {
                    // 2. Safe Error Handling without 'any'
                    const message =
                        error instanceof Error
                            ? error.message
                            : t('drivers.messages.create_error');
                    const backendMessage =
                        (
                            error as {
                                response?: { data?: { message?: string } };
                            }
                        )?.response?.data?.message ?? message;

                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="failed"
                            description={backendMessage}
                        />
                    ));
                }
            });
        },
        [mutate, router, t]
    );

    const handleQrClose = (isOpen: boolean) => {
        setOpenQrDialog(isOpen);
        // 3. Navigation Guard: Only redirect once the QR dialog is dismissed
        if (!isOpen) {
            router.push('/dashboard/driver');
        }
    };

    return (
        <>
            <DriverForm
                driver={driverDefaultValues}
                onFormValid={onFormValid}
                isLoading={isPending} // Pass mutation state to disable buttons
            />

            <QRGeneratDialog
                open={openQrDialog}
                onOpenChange={handleQrClose}
                qrType={t('drivers.messages.qr_dialog')}
                value={qrLink}
            />
        </>
    );
};

export default DriverCreationPage;
