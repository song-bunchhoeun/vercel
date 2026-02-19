'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Loader2, Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Shared component for reusable status management

// Enriched types from the main page
import { UIJob, UIVisit } from '@/app/dashboard/job-dispatch/JobDispatchList';
import { TaskStatusCell } from '@/components/TaskStatusCell/TaskStatusCell';
import { SHIPMENT_TASK_TYPE } from './(form)/job.dispatch.service';

interface DispatchListItemDetailProps {
    isLoading: boolean;
    selectedJob: UIJob | null;
    onClose?: () => void;
}

export default function DispatchListItemDetail({
    isLoading,
    selectedJob,
    onClose
}: DispatchListItemDetailProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    if (!selectedJob) return null;

    const stats = [
        {
            label: t('job_dispatch.details.stats.total_shipments'),
            value: selectedJob.metrics?.totalShipments ?? 0
        },
        {
            label: t('job_dispatch.details.stats.zone'),
            value: selectedJob.driver?.zone ?? t('job_dispatch.details.tbd')
        }
    ];

    return (
        <div
            className={cn(
                'absolute left-0 right-0 bottom-0 z-1001 transition-all duration-500 ease-in-out border-t rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bg-white',
                expanded ? 'h-full' : 'h-[48%]'
            )}
        >
            <div className="h-full flex flex-col p-6 overflow-hidden">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-0.5">
                        <h2 className="font-bold text-[18px] text-neutral-900 tracking-tight">
                            {t('job_dispatch.details.drawer_title')}
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? (
                                <Minimize2 size={14} />
                            ) : (
                                <Maximize2 size={14} />
                            )}
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
                            onClick={onClose}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </div>

                <Separator className="bg-neutral-200" />

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                        <p className="text-[14px] text-neutral-500">
                            {t('job_dispatch.details.syncing_task_data')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats Row */}
                        {expanded && (
                            <div
                                className={cn(
                                    'flex gap-2 flex-wrap pt-4 transition-all duration-300'
                                )}
                            >
                                {stats.map((i) => (
                                    <div
                                        key={i.label}
                                        className="flex items-center border border-neutral-200 py-1.5 px-3 bg-neutral-50 rounded-lg text-[12px] gap-2"
                                    >
                                        <span className="font-bold text-neutral-500 tracking-tight">
                                            {i.label}
                                        </span>
                                        <div className="w-px h-3 bg-neutral-300" />
                                        <span className="font-bold">
                                            {i.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Timeline Scroll Area */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar pt-4 pr-2">
                            <DeliveryRow
                                visits={selectedJob.visits || []}
                                selectedJob={selectedJob}
                                t={t}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

import { TFunction } from 'i18next';

function DeliveryRow({
    visits,
    selectedJob,
    t
}: {
    visits: UIVisit[];
    selectedJob: UIJob;
    t: TFunction;
}) {
    return (
        <div className="relative">
            {visits.map((visit, index) => {
                const isCurrent =
                    visit.visitId === selectedJob.currentVisit?.visitId;

                return (
                    <div
                        key={visit.visitId}
                        className={cn(
                            'pl-12 relative pb-6 transition-all duration-300',
                            isCurrent && ''
                        )}
                    >
                        {/* Vertical Line */}
                        <div className="absolute top-0 bottom-0 left-6 border-l-2 border-dashed border-neutral-200 group-last:border-none" />

                        {/* Timeline Node */}
                        <div
                            className={cn(
                                'absolute left-3 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center z-10 shadow-sm',
                                visit.statusBorder
                            )}
                        >
                            <div
                                className={cn(
                                    'w-2.5 h-2.5 rounded-full',
                                    visit.statusBg
                                )}
                            />
                        </div>

                        {/* Visit Header */}
                        <div className="flex flex-col mb-4">
                            <p className="text-[16px] font-bold text-primary">
                                #{String(index + 1).padStart(2, '0')}{' '}
                                {t('job_dispatch.details.est_arrival_label')}:{' '}
                                {selectedJob.estimateArrival ? (
                                    <>
                                        {selectedJob.estimateArrival.hour}
                                        :00{' '}
                                        {t(selectedJob.estimateArrival.ampmKey)}
                                    </>
                                ) : (
                                    t('job_dispatch.details.tbd')
                                )}
                            </p>
                            <p className="text-[14px] text-neutral-700 font-medium leading-relaxed mt-1">
                                <span className="text-neutral-400 font-bold">
                                    {visit.warehouseName
                                        ? `${t('job_dispatch.details.warehouse')}: `
                                        : `${t('job_dispatch.details.customer')}: `}
                                </span>
                                {visit?.address?.address}
                            </p>
                        </div>

                        {/* Task Cards */}
                        <div className="space-y-4">
                            {visit.tasks.map((task) => (
                                <div
                                    key={task.taskId}
                                    className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm space-y-3 transition-all hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start relative">
                                        <div className="flex flex-1 flex-col gap-0.5 pr-34">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-neutral-400 tracking-tighter">
                                                    {t(
                                                        'job_dispatch.details.shipment_prefix'
                                                    )}
                                                    {task.shipmentId?.slice(
                                                        -6
                                                    ) ||
                                                        t(
                                                            'job_dispatch.details.tbd'
                                                        )}
                                                </span>
                                                <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-500 font-black uppercase">
                                                    {task.taskType ===
                                                        SHIPMENT_TASK_TYPE.DropOff &&
                                                        t(
                                                            'job_dispatch.details.task_types.drop_off'
                                                        )}
                                                    {task.taskType ===
                                                        SHIPMENT_TASK_TYPE.PickUp &&
                                                        t(
                                                            'job_dispatch.details.task_types.pick_up'
                                                        )}
                                                </span>
                                            </div>
                                            <p className="text-[14px] font-bold text-primary truncate">
                                                {
                                                    task.customerData
                                                        ?.customerName
                                                }
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5 min-w-[100px] absolute right-0 top-0">
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                                {t(
                                                    'job_dispatch.list_page.card.task_status'
                                                )}
                                            </p>
                                            {/* INTEGRATED SHARED COMPONENT */}
                                            <TaskStatusCell
                                                id={task.shipmentId}
                                                status={task.status}
                                                taskType={task.taskType}
                                                isEditable={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[14px] text-neutral-600 font-medium">
                                            {
                                                task.customerData
                                                    ?.primaryPhoneNumber
                                            }
                                        </p>
                                        <p className="text-[14px] text-neutral-500 leading-tight">
                                            {task.customerData?.address}
                                        </p>
                                    </div>

                                    {/* Task Note with ellipse */}
                                    {task.note && (
                                        <div className="mt-3 pt-3 border-t border-neutral-50">
                                            <p
                                                className="text-[13px] text-neutral-400 italic truncate"
                                                title={task.note}
                                            >
                                                <span className="font-bold not-italic mr-1 text-[11px] uppercase">
                                                    {t(
                                                        'job_dispatch.details.note'
                                                    )}
                                                    :
                                                </span>
                                                {task.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
