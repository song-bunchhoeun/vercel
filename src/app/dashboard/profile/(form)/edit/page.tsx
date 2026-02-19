'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Components
import UserForm from '@/app/dashboard/user/(form)/user.form'; // Reuse the UserForm component
import {
    userDefaultValues,
    UserRequestData
} from '@/app/dashboard/user/(form)/user.form.service';
import Toast from '@/components/common/toast/Toast';

// Hooks
import { useGetUserProfile, useUpdateUserProfile } from '@/hooks/useUsers';

const EditProfilePage = () => {
    const { t } = useTranslation();
    const router = useRouter();

    // 1. Specific Profile Hooks
    const { data: profile, isLoading: isFetching } = useGetUserProfile();
    const { mutate, isPending: isUpdating } = useUpdateUserProfile();

    // 2. Data Hydration: Map ProfileResponseData to UserRequestData
    const profileFormData: UserRequestData = useMemo(() => {
        const baseData = userDefaultValues;
        if (!profile) return baseData;

        return {
            ...baseData,
            id: profile.id,
            username: profile.username,
            phoneNumber: profile.loginPhone,
            isAdmin: profile.isAdmin,
            status: profile.status,
            warehouseId: profile.warehouse?.id ?? baseData.warehouseId,
            profileUrl: profile.profileUrl
        };
    }, [profile]);

    // 3. Form Submission Logic
    const onFormValid = (formData: UserRequestData) => {
        const payload = new FormData();

        // Handle File Upload (Requirement: 'photo' key)
        if (formData.photo instanceof File) {
            payload.append('photo', formData.photo);
        }

        if (formData.photo === undefined && formData.profileUrl) {
            payload.append('profileUrl', formData.profileUrl);
        }

        payload.append('isAdmin', String(formData.isAdmin));

        // Business Rule: Send warehouseId only if not Admin
        if (!formData.isAdmin && formData.warehouseId !== undefined) {
            payload.append('warehouseId', String(formData.warehouseId));
        }

        // Standard string mapping
        (['username', 'phoneNumber'] as const).forEach((key) => {
            const value = formData[key];
            if (value) payload.append(key, String(value));
        });

        mutate(payload, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t(
                            'profile.alerts.success',
                            'Profile updated successfully.'
                        )}
                    />
                ));
                // Return to profile view on success
                router.push('/dashboard/profile');
            },
            //eslint-disable-next-line
            onError: (error: any) => {
                const backendMessage =
                    error?.response?.data?.message ||
                    t('profile.alerts.failed', 'Update failed');

                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={backendMessage}
                    />
                ));
            }
        });
    };

    // 4. Loading Guard
    if (isFetching) {
        return (
            <div className="flex h-48 items-center justify-center bg-card rounded-lg border border-border">
                <p className="text-muted-foreground animate-pulse text-sm font-medium">
                    {t(
                        'profile.fetching_details',
                        'Fetching profile details...'
                    )}
                </p>
            </div>
        );
    }

    return (
        <UserForm
            user={profileFormData}
            onFormValid={onFormValid}
            isEdit
            isLoading={isUpdating}
            // Optional: Pass a prop to change the title from "Edit User" to "Edit Profile"
            title={t('profile.edit_title', 'Edit Profile')}
            profile
        />
    );
};

export default EditProfilePage;
