'use client';

import UserForm from '@/app/dashboard/user/(form)/user.form';
import {
    userDefaultValues,
    UserRequestData
} from '@/app/dashboard/user/(form)/user.form.service';
import Toast from '@/components/common/toast/Toast';
import QRGeneratDialog from '@/components/QRCode/QRGenerateDialog';
import { useCreateUser } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const UserCreationPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { mutate, isPending } = useCreateUser();

    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [qrLink, setQrLink] = useState('');

    const onFormValid = useCallback(
        (formData: UserRequestData) => {
            const newFormData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                // 1. Map 'photo' explicitly for the multipart upload
                if (key === 'photo' && value instanceof File) {
                    newFormData.append('photo', value);
                }
                // 2. Business Logic: Only append warehouseId for non-admin users
                else if (key === 'warehouseId') {
                    if (!formData.isAdmin) {
                        newFormData.append('warehouseId', String(value));
                    }
                }
                // 3. Skip 'profileUrl' if it exists in formData (since we use 'photo' for the API)
                else if (key === 'profileUrl') {
                    return;
                }
                // 4. Handle all other fields
                else {
                    newFormData.append(key, String(value));
                }
            });

            mutate(newFormData, {
                onSuccess: (res) => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description={t('users.form.create_success')}
                        />
                    ));

                    const dynamicUrl = res?.data?.dynamicActiveurl;
                    if (dynamicUrl) {
                        setQrLink(dynamicUrl);
                        setOpenQrDialog(true);
                    } else {
                        // If no QR is needed, we can head back to the list immediately
                        router.push('/dashboard/user');
                    }
                },
                //eslint-disable-next-line
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        t('users.form.create_error');

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

    const handleQrClose = (open: boolean) => {
        setOpenQrDialog(open);
        // Navigate back to list once the QR dialog is dismissed
        if (!open) {
            router.push('/dashboard/user');
        }
    };

    return (
        <>
            <UserForm
                user={userDefaultValues}
                onFormValid={onFormValid}
                isLoading={isPending}
                title={t('users.form.create_title')}
            />

            <QRGeneratDialog
                open={openQrDialog}
                onOpenChange={handleQrClose}
                qrType={t('users.form.qr_activate')}
                value={qrLink}
            />
        </>
    );
};

export default UserCreationPage;
