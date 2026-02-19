'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { ApiError } from 'next/dist/server/api-utils';
import L, { LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapPanel from '@/components/MapLayout/MapPanel';
import DispatchListPageTitle from './page-list-title';
import DispatchListItem from './page-list-item';
import DispatchListItemDetail from '@/app/dashboard/job-dispatch/page-list-item-detail';
import BaseForm from '@/components/BaseForm/BaseForm';
import { JobDispatchCard } from '@/components/JobDispatch/JobDispatchCard';
import Toast from '@/components/common/toast/Toast';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { getShipmentIcon } from '@/components/JobDispatch/MapMaker';

import {
    DISPATCH_STATUS,
    JobDispatchListSchema,
    SHIPMENT_TASK_STATUS
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import {
    ListFormValues,
    useDispatchJobById,
    useGetJobDetail,
    useGetListJob
} from '@/hooks/useJobDispatchs';
import { Job, VisitData } from '@/models/response.model';
import { useGetShipments } from '@/hooks/useShipments';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';

export interface UIVisit extends VisitData {
    statusColor: string;
    statusBg: string;
    statusBorder: string;
    statusLabel: string;
}

export interface UIJob extends Omit<Job, 'visits'> {
    visits: UIVisit[];
    currentVisit: UIVisit;
    estimateArrival: { hour: string; ampmKey: string } | null;
}

const jobListDefaultValues = {
    searchText: '',
    fromDate: '',
    toDate: '',
    top: 15,
    page: 1,
    status: DISPATCH_STATUS.dispatch.value
};

export function JobDispatchListContent() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const markerGroupRef = useRef<LayerGroup | null>(null);
    const { mapRef, isReady } = useMapLayoutContext();
    const lastZoomedJobId = useRef<string | null>(null);

    // 1. Data States
    const [selectedJob, setSelectedJob] = useState<UIJob | null>(null);
    const [autoSelectEnabled, setAutoSelectEnabled] = useState(true);
    const [displayJobs, setDisplayJobs] = useState<UIJob[]>([]);
    const [dispatchingJobId, setDispatchingJobId] = useState<string | null>(
        null
    );

    // 🚀 FIX: State to track if Web Worker is currently enriching data
    const [isEnriching, setIsEnriching] = useState(false);

    // 2. URL Filters
    const currentFilters = useMemo<ListFormValues>(
        () => ({
            searchText:
                searchParams.get('searchText') ??
                jobListDefaultValues.searchText,
            fromDate:
                searchParams.get('fromDate') ?? jobListDefaultValues.fromDate,
            toDate: searchParams.get('toDate') ?? jobListDefaultValues.toDate,
            status: searchParams.get('status')
                ? Number(searchParams.get('status'))
                : jobListDefaultValues.status,
            top: Number(searchParams.get('top') ?? jobListDefaultValues.top),
            page: Number(searchParams.get('page') ?? jobListDefaultValues.page)
        }),
        [searchParams]
    );

    const { data: listResponse, isFetching: isListLoading } =
        useGetListJob(currentFilters);
    const { isLoading: isDetailLoading } = useGetJobDetail(
        selectedJob?.jobId || null
    );
    const { data: shipments } = useGetShipments({ top: 15, page: 1 });
    const shipmentLength = shipments?.value.length ?? 0;

    // 🚀 FIX: Master Loading state (API is loading OR Worker is processing)
    const isGlobalLoading = isListLoading || isEnriching;

    // 3. Web Worker Enrichment Logic
    useEffect(() => {
        const rawJobs = listResponse?.value ?? [];

        if (rawJobs.length === 0) {
            setDisplayJobs([]);
            setSelectedJob(null);
            setIsEnriching(false); // No data to enrich, so we are done
            return;
        }

        // 🚀 Set loading to true before starting worker
        setIsEnriching(true);

        const worker = new Worker(
            new URL('./job-status.worker.ts', import.meta.url)
        );

        worker.onmessage = (event: MessageEvent<UIJob[]>) => {
            const enriched = event.data;
            setDisplayJobs(enriched);

            if (selectedJob) {
                const update = enriched.find(
                    (j) => j.jobId === selectedJob.jobId
                );
                if (update) setSelectedJob(update);
            }

            // 🚀 Work finished: Reveal the UI
            setIsEnriching(false);
        };

        worker.postMessage(rawJobs);
        return () => worker.terminate();
    }, [listResponse]);

    // 4. Map Marker Logic
    useEffect(() => {
        if (!isReady || !mapRef.current) return;
        const map = mapRef.current;

        if (!markerGroupRef.current) {
            markerGroupRef.current = L.layerGroup().addTo(map);
        }
        const group = markerGroupRef.current;

        if (!selectedJob || !selectedJob.visits) {
            group.clearLayers();
            lastZoomedJobId.current = null;
            return;
        }

        group.clearLayers();
        const markerCoords: L.LatLngTuple[] = [];

        selectedJob.visits.forEach((visit, index) => {
            const coords = visit.address?.geometry?.coordinates;
            if (!coords || coords.length < 2) return;
            const position: L.LatLngTuple = [coords[1], coords[0]];
            markerCoords.push(position);

            const safeIcon =
                getShipmentIcon(
                    SHIPMENT_TASK_STATUS.NEW,
                    !!visit.warehouseName,
                    index + 1
                ) || new L.Icon.Default();

            try {
                L.marker(position, { icon: safeIcon }).addTo(group).bindPopup(`
                    <div class="p-1">
                        <p class="font-bold text-primary">${t('job_dispatch.details.stop_prefix')}${index + 1}</p>
                        <p class="text-sm">${visit.warehouseName || visit.customerName}</p>
                    </div>
                `);
            } catch (err) {
                console.error(err);
            }
        });

        if (
            markerCoords.length > 0 &&
            lastZoomedJobId.current !== selectedJob.jobId
        ) {
            const bounds = L.latLngBounds(markerCoords);
            lastZoomedJobId.current = selectedJob.jobId;
            requestAnimationFrame(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                    mapRef.current.fitBounds(bounds, {
                        padding: [50, 50],
                        animate: true
                    });
                }
            });
        }
    }, [selectedJob, isReady, mapRef, t]);

    // 5. Auto-selection & URL Sync
    useEffect(() => {
        if (autoSelectEnabled && !selectedJob && displayJobs.length > 0) {
            setSelectedJob(displayJobs[0]);
        }
    }, [displayJobs, selectedJob, autoSelectEnabled]);

    const updateUrl = useCallback(
        (newValues: Partial<ListFormValues>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(newValues).forEach(([key, value]) => {
                if (value !== '' && value != null)
                    params.set(key, String(value));
                else params.delete(key);
            });

            if (
                newValues.status !== undefined ||
                newValues.searchText !== undefined
            ) {
                params.set('page', '1');
                params.set('top', '15');
                setSelectedJob(null);
                setAutoSelectEnabled(true);
            }
            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false
            });
        },
        [pathname, router, searchParams]
    );

    const { mutate: dispatch } = useDispatchJobById();
    const handleDispatchJob = (jobId: string) => {
        setDispatchingJobId(jobId);
        dispatch(jobId, {
            onSuccess: () => {
                toast.custom((tid) => (
                    <Toast
                        toastId={tid}
                        status="success"
                        description={t('job_dispatch.messages.job_dispatched')}
                    />
                ));
                setDispatchingJobId(null);
            },
            onError: (err) => {
                const axiosErr = err as AxiosError<ApiError>;
                toast.custom((tid) => (
                    <Toast
                        toastId={tid}
                        status="failed"
                        description={
                            axiosErr?.response?.data?.message ??
                            t('job_dispatch.list_page.card.failed')
                        }
                    />
                ));
                setDispatchingJobId(null);
            }
        });
    };

    return (
        <BaseForm
            id="job-dispatch-filters"
            schema={JobDispatchListSchema}
            defaultValues={currentFilters}
            onChange={updateUrl}
        >
            <div className="flex flex-col h-full bg-neutral-50/30">
                <DispatchListPageTitle
                    activeStatus={currentFilters.status ?? 0}
                    onChangeStatus={(status: number) => updateUrl({ status })}
                    showCreateButton={
                        shipmentLength > 0 && displayJobs.length > 0
                    }
                />

                {/* 🚀 Loading state remains until BOTH API and Worker are ready */}
                {isGlobalLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                        <p className="text-sm text-neutral-400 font-medium">
                            {t('job_dispatch.list_page.syncing_jobs')}
                        </p>
                    </div>
                )}

                {/* 🚀 content is only evaluated when loading is strictly false */}
                {!isGlobalLoading && (
                    <div className="flex flex-1 gap-6 px-8 py-4 overflow-hidden">
                        {shipmentLength === 0 && (
                            <ListEmptyDataComponent
                                image="/nodata/job_dispatch.svg"
                                title_no_data={t(
                                    'job_dispatch.empty_states.no_shipments_title'
                                )}
                                subtitle_no_data={t(
                                    'job_dispatch.empty_states.no_shipments_desc'
                                )}
                                createHref="/"
                                createLabel={t(
                                    'job_dispatch.list_page.create_btn'
                                )}
                                disabled={true}
                            />
                        )}

                        {shipmentLength !== 0 && displayJobs.length === 0 && (
                            <ListEmptyDataComponent
                                image="/nodata/job_dispatch.svg"
                                title_no_data={t(
                                    'job_dispatch.empty_states.no_dispatch_title'
                                )}
                                subtitle_no_data={t(
                                    'job_dispatch.empty_states.no_dispatch_desc'
                                )}
                                createHref="/dashboard/job-dispatch/create"
                                createLabel={t(
                                    'job_dispatch.list_page.create_btn'
                                )}
                            />
                        )}

                        {shipmentLength !== 0 && displayJobs.length !== 0 && (
                            <>
                                <div className="w-5/12 flex flex-col overflow-y-auto custom-scrollbar">
                                    <JobDispatchCard
                                        cardContent={displayJobs.map((item) => (
                                            <DispatchListItem
                                                key={item.jobId}
                                                jobDispatch={item}
                                                isSelected={
                                                    selectedJob?.jobId ===
                                                    item.jobId
                                                }
                                                onSelect={() => {
                                                    setAutoSelectEnabled(false);
                                                    setSelectedJob(item);
                                                }}
                                                onDispatch={handleDispatchJob}
                                                isDispatching={
                                                    dispatchingJobId ===
                                                    item.jobId
                                                }
                                            />
                                        ))}
                                    />
                                </div>

                                <div className="w-7/12 h-full flex flex-col relative rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
                                    <div className="flex-1">
                                        {selectedJob && (
                                            <div className="flex gap-2 flex-wrap pb-4 absolute top-3 left-14 z-1001">
                                                <div className="flex items-center border py-0.5 px-2 bg-white rounded-md text-sm gap-1">
                                                    <span className="font-medium">
                                                        {t(
                                                            'job_dispatch.details.stats.total_shipments'
                                                        )}
                                                    </span>
                                                    <span className="border-l h-3 mx-1"></span>
                                                    <span className="text-gray-700">
                                                        {
                                                            selectedJob?.metrics
                                                                ?.totalShipments
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center border py-0.5 px-2 bg-white rounded-md text-sm gap-1">
                                                    <span className="font-medium">
                                                        {t(
                                                            'job_dispatch.details.stats.zone'
                                                        )}
                                                    </span>
                                                    <span className="border-l h-3 mx-1"></span>
                                                    <span className="text-gray-700">
                                                        {
                                                            selectedJob?.driver
                                                                .zone
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <MapPanel />
                                    </div>
                                    <div className="h-[48%]"></div>
                                    <DispatchListItemDetail
                                        isLoading={isDetailLoading}
                                        selectedJob={selectedJob}
                                        onClose={() => {
                                            setAutoSelectEnabled(false);
                                            setSelectedJob(null);
                                            if (markerGroupRef.current)
                                                markerGroupRef.current.clearLayers();
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </BaseForm>
    );
}
