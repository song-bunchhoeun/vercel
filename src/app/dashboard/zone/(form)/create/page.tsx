'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import Toast from '@/components/common/toast/Toast';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { useCreateZone } from '@/hooks/useZone';
import { useTranslation } from 'react-i18next';
import ZoneForm from '../zone.form';
import { zoneDefaultValues, ZoneRequest } from '../zone.form.service';

const ZoneCreatePage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mutate, isPending } = useCreateZone();

    // 1. Drawing State from Context
    const { drawnGeoJson, setDrawnGeoJson, drawnItemsRef, mapRef } =
        useMapLayoutContext();

    // 2. Lifecycle Cleanup: Clear map layers when leaving
    useEffect(() => {
        const map = mapRef.current;
        return () => {
            if (drawnItemsRef.current) {
                drawnItemsRef.current.clearLayers?.();
                if (map && map.hasLayer(drawnItemsRef.current)) {
                    map.removeLayer(drawnItemsRef.current);
                }
                drawnItemsRef.current = null;
            }
            setDrawnGeoJson([]);
        };
    }, [drawnItemsRef, mapRef, setDrawnGeoJson]);

    const onFormValid = (data: ZoneRequest) => {
        // 3. Payload Construction
        // Sync map drawings into the form data
        const payload: ZoneRequest = {
            ...data,
            customPolygon:
                drawnGeoJson && drawnGeoJson.length > 0
                    ? drawnGeoJson
                    : undefined
        };

        mutate(payload, {
            onSuccess: () => {
                toast.custom((id) => (
                    <Toast
                        toastId={id}
                        status="success"
                        description={t('zones.form.create_success')}
                    />
                ));
                // 4. Return to list view
                router.push('/dashboard/zone');
            },
            onError: (error: unknown) => {
                const message =
                    error instanceof Error
                        ? error.message
                        : t('zones.form.create_error');
                const backendMessage =
                    (error as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message ?? message;

                toast.custom((id) => (
                    <Toast
                        toastId={id}
                        status="failed"
                        description={backendMessage}
                    />
                ));
            }
        });
    };

    return (
        <>
            <ZoneForm
                zone={zoneDefaultValues}
                onFormValid={onFormValid}
                customPolygon={drawnGeoJson}
                isLoading={isPending}
            />
        </>
    );
};

export default ZoneCreatePage;
