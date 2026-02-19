'use client';

import {
    Job,
    JobOptimizationResponse
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import JobDriverConfirmation from '@/app/dashboard/job-dispatch/(form)/JobDriverConfirmation';
import MapPanel from '@/components/MapLayout/MapPanel';
import { Button } from '@/components/ui/button';
import {
    JobListFormValues,
    useGetJobDetail,
    useRefetchJobOptimization
} from '@/hooks/useJobDispatchs';
import { Loader2, RotateCcw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L, { LayerGroup } from 'leaflet';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { getShipmentIcon } from '@/components/JobDispatch/MapMaker';
import { useRef, useMemo } from 'react';

export default function JobDispatchEditComponent() {
    const { t } = useTranslation();
    const { id } = useParams();
    const router = useRouter();

    // Map
    const [showMap, setShowMap] = useState(false);
    const markerGroupRef = useRef<LayerGroup | null>(null);
    const { mapRef } = useMapLayoutContext();
    const [selectedJobForMap, setSelectedJobForMap] = useState<Job | null>(
        null
    );

    const [jobViewData, setJobViewData] =
        useState<JobOptimizationResponse | null>(null);

    const [isModifiedJob, setIsModifiedJob] = useState(false);
    const [dispatchJobs, setDispatchJobs] = useState<string[]>([]);

    const { data, isLoading } = useGetJobDetail(String(id));

    const transformWorkerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!data) return;

        if (data) {
            setJobViewData({
                success: true,
                statusCode: 200,
                message: 'Job details retrieved successfully',
                data: {
                    value: [data],
                    unassignedShipments: []
                },
                timestamp: ''
            });

            setSelectedJobForMap(data);
        }

        if (data.jobId) {
            setDispatchJobs([data.jobId]);
        }
    }, [data]);

    // Map
    useEffect(() => {
        setShowMap(true);
    }, []);

    const mapJobShipments = useMemo(() => {
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
                    status: visit.tasks?.[0]?.status ?? 0,
                    taskType: visit.tasks?.[0]?.type ?? 0,
                    index: index + 1
                };
            });
    }, [selectedJobForMap]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (!mapJobShipments.length) return;

        const map = mapRef.current;

        if (!markerGroupRef.current) {
            markerGroupRef.current = L.layerGroup().addTo(map);
        }

        markerGroupRef.current.clearLayers();

        mapJobShipments.forEach((item) => {
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
            mapJobShipments.map((s) => [s.lat, s.lng] as L.LatLngTuple)
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15
        });
    }, [mapJobShipments, mapRef]);

    // Back Button
    const handleBackButton = () => {
        router.push('/dashboard/job-dispatch');
    };

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
        <>
            <div className="flex flex-col h-full">
                <div className="flex flex-[1_1_auto] h-full">
                    <div className="flex w-full">
                        <div className="w-5/12">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-20 gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                                    <p className="text-sm text-neutral-400 font-medium">
                                        {t(
                                            'job_dispatch.list_page.syncing_jobs'
                                        )}
                                    </p>
                                </div>
                            )}

                            {jobViewData && (
                                <JobDriverConfirmation
                                    jobViewData={jobViewData}
                                    isModifiedJob={isModifiedJob}
                                    setIsModifiedJob={setIsModifiedJob}
                                    setCurrentStep={handleBackButton}
                                    onSelectJobForMap={setSelectedJobForMap}
                                    dispatchJobs={dispatchJobs}
                                    title="Edit Driver's Job"
                                    isEditJob={true}
                                />
                            )}
                        </div>

                        {showMap && (
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
                                                onClick={handleRefreshButton}
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
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
