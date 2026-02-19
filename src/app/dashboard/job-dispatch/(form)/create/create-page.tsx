'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import JobDispatchForm from '@/app/dashboard/job-dispatch/(form)/job.dispatch.form';
import Toast from '@/components/common/toast/Toast';

// Hooks
import { ShipmentFilters, useGetShipments } from '@/hooks/useShipments';
import {
    JobListFormValues,
    useCreateJobDispatch,
    useCreateSoloJob,
    useRefetchJobOptimization
} from '@/hooks/useJobDispatchs';

// Service & Types
import {
    CURRENT_STEP,
    JobDispatchRequest,
    ShipmentCardData,
    DriverCardData,
    Step,
    JobOptimizationResponse,
    Job,
    SHIPMENT_TASK_STATUS,
    DRIVER_STATUS
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { ParcelData } from '@/models/response.model';
import MapProvider from '@/components/MapLayout/MapProvider';
import MapPanel from '@/components/MapLayout/MapPanel';
import L, { LayerGroup } from 'leaflet';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { getShipmentIcon } from '@/components/JobDispatch/MapMaker';
import JobDriverConfirmation from '@/app/dashboard/job-dispatch/(form)/JobDriverConfirmation';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetListDrivers } from '@/hooks/useDrivers';

/**
 * Orchestrates the creation of a Job Dispatch.
 * Manages Step 1 (Shipment Selection), Step 2 (Driver Assignment), and Step 3 (Confirmation).
 */
export default function JobDispatchCreateComponent() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Map
    const [showMap, setShowMap] = useState(false);
    const markerGroupRef = useRef<LayerGroup | null>(null);
    const { mapRef } = useMapLayoutContext();
    const [selectedJobForMap, setSelectedJobForMap] = useState<Job | null>(
        null
    );

    useEffect(() => {
        setShowMap(true);
    }, []);

    // 1. STEP STATE
    const [currentStep, setCurrentStep] = useState<Step>(CURRENT_STEP.ONE);

    const [jobViewData, setJobViewData] =
        useState<JobOptimizationResponse | null>(null);
    const [isModifiedJob, setIsModifiedJob] = useState(false);
    const [dispatchJobs, setDispatchJobs] = useState<string[]>([]);

    const transformWorkerRef = useRef<Worker | null>(null);
    const jobIdWorkerRef = useRef<Worker | null>(null);

    useEffect(() => {
        transformWorkerRef.current = new Worker(
            new URL('../job-transform.worker.ts', import.meta.url)
        );

        transformWorkerRef.current.onmessage = (e) => {
            if (e.data.success) {
                setJobViewData(e.data.data);
            }
        };

        return () => {
            // cleanup when component unmounts
            transformWorkerRef.current?.terminate();
            transformWorkerRef.current = null;
        };
    }, []);

    useEffect(() => {
        jobIdWorkerRef.current = new Worker(
            new URL('../job-id.worker.ts', import.meta.url)
        );

        jobIdWorkerRef.current.onmessage = (e) => {
            if (e.data.success) {
                setDispatchJobs(e.data.jobIds);
            }
        };

        return () => {
            jobIdWorkerRef.current?.terminate();
            jobIdWorkerRef.current = null;
        };
    }, []);

    // 2. SHIPMENT DATA FETCHING & FILTERING
    const shipmentDefaultListValues: ShipmentFilters = useMemo(
        () => ({
            top: 9999, // Fetch large batch for selection
            status: [SHIPMENT_TASK_STATUS.NEW, SHIPMENT_TASK_STATUS.FAILED], // Ready for Dispatch status codes
            type: searchParams.getAll('type').map(Number),
            page: 1
            // syncStatus: [PARCEL_SYNC_STATUS.SYNCED]
        }),
        [searchParams]
    );

    const [filterData, setFilterData] = useState<ShipmentFilters>(
        shipmentDefaultListValues
    );

    const { data: pagedShipments, isLoading: isShipmentLoading } =
        useGetShipments(filterData);

    // 3. DRIVER DATA FETCHING
    const { data: pagedDrivers, isLoading: isDriverLoading } =
        useGetListDrivers({ top: 9999, page: 1, status: DRIVER_STATUS.ACTIVE });

    // 4. SYNC FILTER STATE TO URL
    useEffect(() => {
        const params = new URLSearchParams();

        filterData.status?.forEach((s) => params.append('status', String(s)));
        filterData.type?.forEach((t) => params.append('type', String(t)));

        // 🚀 ADD THIS: Append syncStatus to the URL parameters
        /* filterData.syncStatus?.forEach((ss) =>
            params.append('syncStatus', String(ss))
        ); */

        router.replace(`${pathname}?${params.toString()}`);
    }, [pathname, filterData, router]);

    /**
     * 🛠️ MAPPING LOGIC: API Response -> UI Component Models
     * Updated to match nested ParcelData and DriverData structures
     */
    const shipments = useMemo<ShipmentCardData[]>(() => {
        if (!pagedShipments?.value) return [];
        return pagedShipments.value.map((s: ParcelData) => ({
            id: s.id,
            dpShipmentId: s.dpShipmentId ?? '',
            name: s.customer.name ?? '',
            address: s.address,
            primaryPhone: s.customer.primaryPhone ?? '',
            secondaryPhone: s.customer.secondaryPhone ?? '',
            qty: s.item.qty,
            amount: s.item.amount,
            currencyType: s.item.currencyType,
            note: s.note ?? '',
            status: s.status!,
            taskType: s.taskType,
            syncStatus: s.syncStatus
        }));
    }, [pagedShipments]);

    const drivers = useMemo<DriverCardData[]>(() => {
        if (!pagedDrivers?.value) return [];
        return pagedDrivers.value.map((d) => ({
            id: d.id,
            name: d.username ?? '', // DriverData uses username for the display name
            phone: d.primaryPhone ?? '',
            avatar: d.profileUrl ?? '',
            zone: d.zone?.name ?? '' // Nested zone object
        }));
    }, [pagedDrivers]);

    // 5. SUBMISSION LOGIC
    const createJobDispatch = useCreateJobDispatch();
    const createSoloJobDispatch = useCreateSoloJob();
    const isDispatching =
        createJobDispatch.isPending || createSoloJobDispatch.isPending;

    const handleFormValid = (payload: JobDispatchRequest) => {
        if (payload.driverIds.length === 1) {
            const formData = {
                shipmentIds: payload.shipmentIds,
                driverId: payload.driverIds[0]
            };

            createSoloJobDispatch.mutateAsync(formData, {
                onSuccess: () => {
                    toast.custom((tid) => (
                        <Toast
                            toastId={tid}
                            status="success"
                            description={t('job_dispatch.alerts.success')}
                        />
                    ));

                    router.push('/dashboard/job-dispatch?status=1');
                },
                //eslint-disable-next-line
                onError: (error: any) => {
                    const errorMessage =
                        error?.response?.data?.message ??
                        'Could not create dispatch.';
                    toast.custom((tId) => (
                        <Toast
                            toastId={tId}
                            status="failed"
                            description={
                                errorMessage === 'Could not create dispatch.'
                                    ? t('job_dispatch.alerts.failed')
                                    : errorMessage
                            }
                        />
                    ));
                }
            });
            return;
        }

        if (payload.driverIds.length > 1) {
            const formData = {
                ...payload
            };

            createJobDispatch.mutateAsync(formData, {
                onSuccess: (data) => {
                    toast.custom((tid) => (
                        <Toast
                            toastId={tid}
                            status="success"
                            description={t('job_dispatch.alerts.success')}
                        />
                    ));

                    // Store full response
                    setJobViewData(data);
                    setCurrentStep(CURRENT_STEP.THREE);
                    setIsModifiedJob(false);

                    // Extract jobIds using worker
                    jobIdWorkerRef.current?.postMessage({
                        jobViewData: data
                    });
                },
                //eslint-disable-next-line
                onError: (error: any) => {
                    const errorMessage =
                        error?.response?.data?.message ??
                        'Could not create dispatch.';
                    toast.custom((tId) => (
                        <Toast
                            toastId={tId}
                            status="failed"
                            description={
                                errorMessage === 'Could not create dispatch.'
                                    ? t('job_dispatch.alerts.failed')
                                    : errorMessage
                            }
                        />
                    ));
                }
            });
            return;
        }
    };

    const handleUpdateTypeFilter = (types: number[]) => {
        setFilterData((prev) => ({ ...prev, type: types }));
    };

    // Map
    const mapShipments = useMemo(() => {
        if (currentStep === CURRENT_STEP.THREE) return [];

        if (!shipments) return [];

        return shipments
            .filter(
                (s) =>
                    s.address?.latitude &&
                    s.address?.longitude &&
                    s.address.latitude !== 0 &&
                    s.address.longitude !== 0
            )
            .map((s, index) => ({
                id: s.id,
                lat: s.address.latitude,
                lng: s.address.longitude,
                status: s.status,
                taskType: s.taskType,
                index: index + 1
            }));
    }, [shipments, currentStep]);

    const mapJobShipments = useMemo(() => {
        if (currentStep !== CURRENT_STEP.THREE) return [];
        if (!selectedJobForMap) return [];

        return selectedJobForMap.visits
            .filter((visit) => {
                const coords = visit.address?.geometry?.coordinates;
                return (
                    Array.isArray(coords) &&
                    coords.length === 2 &&
                    coords[0] !== 0 &&
                    coords[1] !== 0
                );
            })
            .map((visit, index) => {
                const [lng, lat] = visit.address.geometry.coordinates;

                return {
                    id: visit.visitId,
                    lat,
                    lng,
                    status: visit.tasks[0]?.status ?? 'offered',
                    taskType: visit.tasks[0]?.type ?? 'pickup',
                    index: index + 1
                };
            });
    }, [currentStep, selectedJobForMap]);

    const markersToDraw =
        currentStep === CURRENT_STEP.THREE ? mapJobShipments : mapShipments;

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        if (!markerGroupRef.current) {
            markerGroupRef.current = L.layerGroup().addTo(map);
        }

        // clear layer first
        markerGroupRef.current.clearLayers();

        if (!markersToDraw.length) return;

        markersToDraw.forEach((item) => {
            const icon = getShipmentIcon(
                Number(item.status),
                false,
                item.index
            );

            L.marker([item.lat, item.lng], { icon }).addTo(
                markerGroupRef.current!
            );
        });

        const bounds = L.latLngBounds(
            markersToDraw.map((s) => [s.lat, s.lng] as L.LatLngTuple)
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15
        });
    }, [markersToDraw, mapRef]);

    const jobListValues = useMemo<JobListFormValues>(
        () => ({
            jobIds: dispatchJobs,
            top: 9999,
            page: 1,
            status: 'draft'
        }),
        [dispatchJobs]
    );

    const { refetch: refetchJobs } = useRefetchJobOptimization(jobListValues);
    const handleRefreshButton = async () => {
        const result = await refetchJobs();

        if (result.data) {
            transformWorkerRef.current?.postMessage({
                jobListData: result.data
            });
            setIsModifiedJob(false);
        }
    };

    return (
        <MapProvider>
            <div className="flex flex-col h-full">
                <div className="flex flex-[1_1_auto] h-full">
                    {showMap && (
                        <>
                            <div className="flex w-full">
                                <div className="w-5/12">
                                    {currentStep !== 3 && (
                                        <JobDispatchForm
                                            currentStep={currentStep}
                                            setCurrentStep={setCurrentStep}
                                            shipments={shipments}
                                            drivers={drivers}
                                            isLoading={
                                                isShipmentLoading ||
                                                isDriverLoading
                                            }
                                            onChangeType={
                                                handleUpdateTypeFilter
                                            }
                                            onFormValid={handleFormValid}
                                            isPending={isDispatching}
                                        />
                                    )}

                                    {currentStep === 3 && jobViewData && (
                                        <JobDriverConfirmation
                                            jobViewData={jobViewData}
                                            isModifiedJob={isModifiedJob}
                                            setIsModifiedJob={setIsModifiedJob}
                                            setCurrentStep={setCurrentStep}
                                            onSelectJobForMap={
                                                setSelectedJobForMap
                                            }
                                            dispatchJobs={dispatchJobs}
                                        />
                                    )}
                                </div>

                                <div className="relative w-7/12 h-full">
                                    <div className="absolute inset-0 z-0">
                                        <MapPanel />
                                    </div>

                                    {/* Overlay for modified jobs */}
                                    {isModifiedJob && (
                                        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center z-50 p-4 text-center">
                                            <p className="text-[16px] text-white mb-2">
                                                {t(
                                                    'job_dispatch.create_flow.modified_overlay.title'
                                                )}
                                            </p>
                                            <p className="text-white text-[14px] font-light mb-6 max-w-md w-full">
                                                {t(
                                                    'job_dispatch.create_flow.modified_overlay.desc'
                                                )}
                                            </p>
                                            <div className="flex gap-4">
                                                <Button
                                                    className="bg-primary font-light text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                                                    onClick={
                                                        handleRefreshButton
                                                    }
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span>
                                                        {t(
                                                            'job_dispatch.create_flow.modified_overlay.refresh_btn'
                                                        )}
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MapProvider>
    );
}
