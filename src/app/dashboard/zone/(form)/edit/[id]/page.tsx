'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import Toast from '@/components/common/toast/Toast';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { useGetZoneDetail, useUpdateZone } from '@/hooks/useZone';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ZoneForm from '../../zone.form';
import type { ZoneRequest, ZoneResponse } from '../../zone.form.service';

// --- Helpers ---

function isGeoJsonFeatureArray(v: unknown): v is GeoJSON.Feature[] {
    return (
        Array.isArray(v) &&
        v.every((x) => x && typeof x === 'object' && x.type === 'Feature')
    );
}

function toZoneRequest(dto: ZoneResponse): ZoneRequest {
    const provinceIds = dto.provinces?.map((p) => p.id) ?? [];
    const districtIds = dto.districts?.map((d) => d.districtId!) ?? [];
    const countryId = dto.provinces?.[0]?.countryId ?? 1;

    return {
        name: dto?.name ?? '',
        areaSize: dto?.areaSize ?? 0,
        countryId,
        provinceIds,
        districtIds,
        status: dto?.status,
        customPolygon: isGeoJsonFeatureArray(dto?.polygon)
            ? dto.polygon
            : undefined
    };
}

/**
 * Hydrate GeoJSON Feature[] -> Leaflet layers
 */
async function hydrateDrawnItems(
    map: L.Map,
    drawnItems: L.FeatureGroup,
    features: GeoJSON.Feature[] | undefined
) {
    if (!drawnItems) return;

    drawnItems.clearLayers();
    if (!features?.length) return;

    const L = (await import('leaflet')).default;

    for (const f of features) {
        L.geoJSON(f).eachLayer((layer) => {
            if (layer instanceof L.Layer) {
                drawnItems.addLayer(layer);
            }
        });
    }

    if (map && drawnItems.getLayers().length > 0) {
        const bounds = drawnItems.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds.pad(0.15));
    }
}

const UpdateZonePage = () => {
    const { t } = useTranslation();
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const zoneId = params?.id;

    const { isReady, mapRef, drawnItemsRef, drawnGeoJson, setDrawnGeoJson } =
        useMapLayoutContext();

    const {
        data: zoneData,
        isLoading: isFetching,
        error: loadError,
        isError
    } = useGetZoneDetail(zoneId);
    const { mutate, isPending: isUpdating } = useUpdateZone(zoneId);

    // 1. Data Hydration: API DTO -> ZoneRequest
    const zoneForForm = useMemo(() => {
        if (!zoneData) return undefined;
        return toZoneRequest(zoneData);
    }, [zoneData]);

    // 2. Map Hydration: Draw existing polygon on map
    useEffect(() => {
        if (!zoneId || !isReady || !mapRef.current || !zoneForForm) return;

        const map = mapRef.current;

        const run = async () => {
            if (!drawnItemsRef.current) {
                const L = (await import('leaflet')).default;
                drawnItemsRef.current = new L.FeatureGroup();
                map.addLayer(drawnItemsRef.current);
            }

            await hydrateDrawnItems(
                map,
                drawnItemsRef.current as L.FeatureGroup,
                zoneForForm.customPolygon
            );

            // Sync context with initial data
            setDrawnGeoJson(zoneForForm.customPolygon ?? []);
        };

        void run();
    }, [zoneId, isReady, mapRef, zoneForForm, drawnItemsRef, setDrawnGeoJson]);

    // 3. Cleanup on Unmount
    useEffect(() => {
        return () => {
            if (drawnItemsRef.current) {
                drawnItemsRef.current.clearLayers?.();
            }
            setDrawnGeoJson([]);
        };
    }, [drawnItemsRef, setDrawnGeoJson]);

    // 4. Submit Handler
    const onFormValid = (data: ZoneRequest) => {
        const payload: ZoneRequest = {
            ...data,
            customPolygon: drawnGeoJson.length ? drawnGeoJson : undefined
        };

        mutate(payload, {
            onSuccess: () => {
                toast.custom((id) => (
                    <Toast
                        toastId={id}
                        status="success"
                        description={t('zones.form.edit_success')}
                    />
                ));
                router.push('/dashboard/zone');
            },
            onError: (error: unknown) => {
                const message =
                    error instanceof Error
                        ? error.message
                        : t('zones.form.load_error');
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

    // Error feedback for initial load
    useEffect(() => {
        if (isError) {
            const message =
                (loadError as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? t('zones.form.load_error');
            toast.error(message);
        }
    }, [isError, loadError, t]);

    if (isFetching) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3 bg-white rounded-2xl border">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm">
                    {t('zones.form.fetching')}
                </p>
            </div>
        );
    }

    return (
        <>
            <ZoneForm
                zone={zoneForForm}
                isEdit
                isLoading={isUpdating}
                onFormValid={onFormValid}
                customPolygon={drawnGeoJson}
            />
        </>
    );
};

export default UpdateZonePage;
