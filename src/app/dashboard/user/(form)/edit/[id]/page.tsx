'use client';

import UserForm from '@/app/dashboard/user/(form)/user.form';
import { UserRequestData } from '@/app/dashboard/user/(form)/user.form.service';
import Toast from '@/components/common/toast/Toast';
import { useGetUserDetail, useUpdateUser } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { use, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const UserEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: selectedId } = use(params);
    const router = useRouter();
    const { t } = useTranslation();
    const { mutate, isPending: isUpdating } = useUpdateUser();
    const { data: user, isLoading: isFetching } = useGetUserDetail(selectedId);

    // 1. Data Hydration: Derive form values directly from query data
    const userFormData: UserRequestData | undefined = useMemo(() => {
        if (!user) return undefined;

        return {
            id: user.id,
            username: user.username,
            phoneNumber: user.loginPhone,
            isAdmin: user.isAdmin,
            status: user.status,
            warehouseId: user.warehouse?.id,
            profileUrl: user.profileUrl
        };
    }, [user]);

    const onFormValid = (formData: UserRequestData) => {
        const newFormData = new FormData();

        // 2. Map 'photo' key correctly for API and handle multipart values
        if (formData.photo instanceof File) {
            newFormData.append('photo', formData.photo);
        }

        if (formData.photo === undefined && formData.profileUrl) {
            newFormData.append('profileUrl', formData.profileUrl);
        }

        newFormData.append('isAdmin', String(formData.isAdmin));

        // Business Rule: Only send warehouseId if not an Admin
        if (!formData.isAdmin && formData.warehouseId) {
            newFormData.append('warehouseId', String(formData.warehouseId));
        }

        // 3. Automated mapping for standard string fields
        (['username', 'phoneNumber'] as const).forEach((key) => {
            const value = formData[key];
            if (value) newFormData.append(key, String(value));
        });

        mutate(
            { id: selectedId, payload: newFormData },
            {
                onSuccess: () => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description={t('users.form.edit_success')}
                        />
                    ));
                    // 4. Return to list view on success
                    router.push('/dashboard/user');
                },
                onError: (error: unknown) => {
                    const message =
                        error instanceof Error
                            ? error.message
                            : t('users.form.edit_error');

                    // Attempt to extract deep backend message if available
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
            }
        );
    };

    // 5. Loading Guard: Prevents form "flicker" while fetching existing data
    if (isFetching) {
        return (
            <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground animate-pulse">
                    {t('users.form.fetching')}
                </p>
            </div>
        );
    }

    return (
        <UserForm
            user={userFormData!}
            onFormValid={onFormValid}
            isEdit
            isLoading={isUpdating}
            title={t('users.form.edit_title')}
        />
    );
};

export default UserEditPage;
