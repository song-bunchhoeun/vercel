'use client';

import { DriverRequestData } from '@/app/dashboard/driver/(form)/driver.form.service';
import Toast from '@/components/common/toast/Toast';
import { useGetDriver, useUpdateDriver } from '@/hooks/useDrivers';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useMemo } from 'react';
import { toast } from 'sonner';
import DriverForm from '../../driver.form';
import { useTranslation } from 'react-i18next';

const DriverEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: selectedId } = use(params);
    const router = useRouter();
    const { t } = useTranslation();

    // 1. Fetch data and mutation hook
    const { data: driverResponse, isFetching } = useGetDriver(selectedId);
    const { mutate, isPending: isUpdating } = useUpdateDriver(selectedId);

    // 2. Data Hydration: Eliminate useState/useEffect mirroring
    const driverInitialData: DriverRequestData | undefined = useMemo(() => {
        if (!driverResponse) return undefined;

        return {
            id: driverResponse.id,
            username: driverResponse.username,
            profileUrl: driverResponse.profileUrl,
            nid: driverResponse.nid,
            zoneId: driverResponse.zoneId,
            fleetType: driverResponse.fleetType,
            primaryPhone: driverResponse.primaryPhone,
            secondaryPhone: driverResponse.secondaryPhone,
            status: driverResponse.status
        };
    }, [driverResponse]);

    const onFormValid = (formData: DriverRequestData) => {
        const newFormData = new FormData();

        // 3. Dynamic FormData construction
        Object.entries(formData).forEach(([key, value]) => {
            // Handle photo: only append if it's a File
            if (key === 'photo') {
                if (value instanceof File) {
                    newFormData.append('photo', value);
                }
                return;
            }

            // Handle profileUrl: only preserve if photo is undefined (not changed)
            // If photo is null (removed) or File (new upload), skip profileUrl
            if (key === 'profileUrl') {
                if (formData.photo === undefined && value) {
                    newFormData.append('profileUrl', String(value));
                }
                return;
            }

            if (value === null || value === undefined) return;

            newFormData.append(key, String(value));
        });

        mutate(newFormData, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t('drivers.messages.update_success')}
                    />
                ));
                // 4. Return to list view
                router.push('/dashboard/driver');
            },
            onError: (error: unknown) => {
                const message =
                    error instanceof Error
                        ? error.message
                        : t('drivers.messages.update_error');
                const backendMessage =
                    (error as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message ?? message;

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

    // 5. Senior Loading Guard
    if (isFetching) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3 bg-white rounded-2xl border">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm">
                    {t('drivers.messages.fetching')}
                </p>
            </div>
        );
    }

    return (
        <DriverForm
            driver={driverInitialData!}
            onFormValid={onFormValid}
            isEdit
            isLoading={isUpdating}
        />
    );
};

export default DriverEditPage;
