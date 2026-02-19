'use client';

import Image from 'next/image';
import { Loader2, PackageIcon, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
    JOB_STATUS,
    SHIPMENT_TASK_STATUS,
    SHIPMENT_TASK_TYPE
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { UIJob } from '@/app/dashboard/job-dispatch/JobDispatchList';
import { TaskData } from '@/models/response.model';
import { useRouter } from 'next/navigation';

interface DispatchListItemProps {
    jobDispatch: UIJob;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDispatch: (jobId: string) => void;
    isDispatching: boolean;
}

export default function DispatchListItem({
    jobDispatch,
    isSelected,
    onSelect,
    onDispatch,
    isDispatching
}: DispatchListItemProps) {
    const { t } = useTranslation();
    const status = jobDispatch.status;
    const router = useRouter();

    /**
     * ✅ String-based comparison logic
     */
    const isDispatchable = status === JOB_STATUS.DRAFT;
    const isActive =
        status === JOB_STATUS.ACTIVE || status === JOB_STATUS.DISPATCHED;
    const isCompleted = status === JOB_STATUS.COMPLETED;

    const handleDispatchNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!jobDispatch.jobId) return;
        onDispatch(jobDispatch.jobId);
    };

    const currentVisit = jobDispatch.currentVisit;

    const activeTask =
        currentVisit?.tasks?.find((t: TaskData) =>
            [
                SHIPMENT_TASK_STATUS.NEW,
                SHIPMENT_TASK_STATUS.IN_TRANSIT,
                SHIPMENT_TASK_STATUS.ARRIVED
            ].includes(t.status)
        ) || currentVisit?.tasks?.[0];

    const handleOnEditJob = (id: string) => {
        router.push(`/dashboard/job-dispatch/edit/${id}`);
    };

    return (
        <Card
            onClick={() => onSelect(String(jobDispatch.jobId))}
            className={cn(
                'rounded-2xl border mb-4 cursor-pointer transition-all duration-200 shadow-none p-0 bg-white relative overflow-hidden',
                isSelected
                    ? 'border-primary ring-1 ring-primary/10 bg-mariner-50/10'
                    : 'border-neutral-200 hover:border-neutral-300'
            )}
        >
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}

            <CardContent className="p-4 space-y-4 bg-white">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-neutral-600">
                        <PackageIcon
                            size={18}
                            className={
                                isSelected ? 'text-primary' : 'text-neutral-400'
                            }
                        />
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[14px] tracking-tight uppercase">
                                {t('job_dispatch.details.job_prefix')}
                                {jobDispatch.jobId.slice(0, 8)}
                            </span>
                            <span className="text-[12px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {jobDispatch.metrics?.totalShipments}{' '}
                                {t(
                                    'job_dispatch.details.stats.total_shipments'
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Status UI logic */}
                    {isDispatchable ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 p-0 rounded-md border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                                onClick={() =>
                                    handleOnEditJob(jobDispatch.jobId)
                                }
                            >
                                <Image
                                    src="/icons/edit.svg"
                                    alt="Edit"
                                    width={14}
                                    height={14}
                                />
                            </Button>
                            <Button
                                onClick={handleDispatchNow}
                                disabled={isDispatching}
                                size="sm"
                                className="h-8 bg-primary text-white text-[12px] font-bold px-3 rounded-md relative overflow-hidden"
                            >
                                <span
                                    className={cn(
                                        isDispatching
                                            ? 'opacity-0'
                                            : 'opacity-100'
                                    )}
                                >
                                    {t(
                                        'job_dispatch.list_page.card.dispatch_now'
                                    )}
                                </span>
                                {isDispatching && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider bg-mango-50 border-mango-200 text-mango-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-mango-500 animate-pulse" />
                                    {t(
                                        'job_dispatch.details.dispatch_statuses.in_transit'
                                    )}
                                </div>
                            )}
                            {isCompleted && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider bg-success-50 border-success-200 text-success-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                                    {t(
                                        'job_dispatch.details.dispatch_statuses.completed'
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Current Visit Card */}
                <div className="bg-accent rounded-xl p-4 border border-neutral-100/50">
                    <div className="flex items-start gap-2 mb-3">
                        <MapPin
                            size={16}
                            className="text-mariner-500 mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-primary leading-tight">
                                #
                                {String(
                                    (jobDispatch.visits?.indexOf(
                                        currentVisit
                                    ) ?? 0) + 1
                                ).padStart(2, '0')}{' '}
                                {t('job_dispatch.details.est_arrival_label')}{' '}
                                {jobDispatch.estimateArrival ? (
                                    <>
                                        {jobDispatch.estimateArrival.hour}:00{' '}
                                        {t(jobDispatch.estimateArrival.ampmKey)}
                                    </>
                                ) : (
                                    t('job_dispatch.details.tbd')
                                )}
                            </p>
                            <p className="text-[14px] text-neutral-800 mt-1 line-clamp-1">
                                <span className="text-neutral-400 font-semibold">
                                    {currentVisit?.warehouseName
                                        ? `${t('job_dispatch.details.warehouse')} `
                                        : `${t('job_dispatch.details.customer')}: `}
                                </span>
                                {currentVisit?.address?.address ||
                                    t('job_dispatch.details.no_active_stop')}
                            </p>
                        </div>
                    </div>

                    {/* Task Details */}
                    {activeTask && (
                        <div className="bg-white rounded-lg p-3 border border-neutral-100 shadow-sm">
                            <div className="flex justify-between items-start relative">
                                <div className="flex flex-1 flex-col gap-0.5 pr-20">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-neutral-400">
                                            {t(
                                                'job_dispatch.details.shipment_prefix'
                                            )}
                                            {activeTask.shipmentId.slice(-6)}
                                        </span>
                                    </div>
                                    <p className="text-[14px] font-bold text-primary truncate">
                                        {activeTask.customerData?.customerName}{' '}
                                        <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-black uppercase border border-neutral-200">
                                            {activeTask.taskType ===
                                                SHIPMENT_TASK_TYPE.DropOff &&
                                                t(
                                                    'job_dispatch.details.task_types.drop_off'
                                                )}
                                            {activeTask.taskType ===
                                                SHIPMENT_TASK_TYPE.PickUp &&
                                                t(
                                                    'job_dispatch.details.task_types.pick_up'
                                                )}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1 absolute top-0 right-0">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                        {t(
                                            'job_dispatch.list_page.card.task_status'
                                        )}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={cn(
                                                'w-2 h-2 rounded-full',
                                                currentVisit.statusBg
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-[12px] font-bold uppercase',
                                                currentVisit.statusColor
                                            )}
                                        >
                                            {t(currentVisit.statusLabel)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[14px] text-neutral-600 font-medium">
                                    {
                                        activeTask.customerData
                                            ?.primaryPhoneNumber
                                    }
                                </p>
                                <p className="text-[14px] text-neutral-500 leading-tight line-clamp-1">
                                    {activeTask.customerData?.address}
                                </p>
                                {activeTask.note && (
                                    <p className="text-[13px] text-neutral-400 italic mt-1 truncate border-t border-neutral-50 pt-1.5">
                                        {t('job_dispatch.details.note')}:{' '}
                                        {activeTask.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 shadow-xs text-center">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter mb-0.5">
                            {t('job_dispatch.metrics.total')}
                        </p>
                        <p className="text-[16px] font-black text-neutral-700">
                            {jobDispatch.metrics?.totalShipments ?? 0}
                        </p>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 shadow-xs text-center">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter mb-0.5">
                            {t('job_dispatch.metrics.done')}
                        </p>
                        <p className="text-[16px] font-black text-success-600">
                            {jobDispatch.metrics?.completedCount ?? 0}
                        </p>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 shadow-xs text-center">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter mb-0.5">
                            {t('job_dispatch.metrics.failed')}
                        </p>
                        <p className="text-[16px] font-black text-error-600">
                            {jobDispatch.metrics?.failedCount ?? 0}
                        </p>
                    </div>
                </div>

                {/* Footer: Driver Info */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-neutral-200">
                            <AvatarImage
                                src={
                                    jobDispatch.driver.profileUrl ||
                                    '/driver-profile.svg'
                                }
                            />
                            <AvatarFallback className="bg-neutral-100 text-neutral-500 text-xs font-bold uppercase">
                                {jobDispatch.driver.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-bold text-[14px] text-neutral-800 leading-none truncate">
                                {jobDispatch.driver.name}
                            </p>
                            <p className="text-[12px] text-neutral-400 font-medium mt-1 truncate">
                                {jobDispatch.driver.phone ||
                                    t('job_dispatch.details.no_phone')}
                            </p>
                        </div>
                    </div>
                    <div className="bg-neutral-100 px-2.5 py-1 text-neutral-500 rounded text-[12px] font-bold uppercase tracking-tight">
                        {jobDispatch.driver.zone}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
