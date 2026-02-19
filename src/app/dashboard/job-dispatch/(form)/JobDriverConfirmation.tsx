'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { ArrowLeft, EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '@/components/ui/accordion';
import OutOfZoneAlert from '@/components/JobDispatch/OutOfZoneAlert';
import DraftShipmentCard from '@/components/JobDispatch/DraftShipmentCard';
import {
    DispatchJobIdsPayload,
    Job,
    JobOptimizationResponse,
    Step,
    UnassignedShipment
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import SelectDriver from '@/components/JobDispatch/DriverDropdown';
import {
    useChangeJobDriver,
    useDispatchJobs,
    useManualAssign,
    useRemoveShipment
} from '@/hooks/useJobDispatchs';
import { toast } from 'sonner';
import Toast from '@/components/common/toast/Toast';
import SelectChangeDriver from '@/components/JobDispatch/SelectChangeDriver';

export interface JobDispatchConfirmationProps {
    jobViewData: JobOptimizationResponse;
    isModifiedJob: boolean;
    setIsModifiedJob: Dispatch<SetStateAction<boolean>>;
    setCurrentStep: Dispatch<SetStateAction<Step>>;
    onSelectJobForMap: Dispatch<SetStateAction<Job | null>>;
    dispatchJobs: string[];
    title?: string;
    isEditJob?: boolean;
}

export interface AssignPayload {
    jobId: string;
    driverId: string;
    shipmentIds: string[];
}

export default function JobDriverConfirmation({
    jobViewData,
    isModifiedJob,
    setIsModifiedJob,
    setCurrentStep,
    onSelectJobForMap,
    dispatchJobs,
    title,
    isEditJob
}: JobDispatchConfirmationProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<{
        jobId: string;
        shipmentIds: string[];
    } | null>(null);

    const [outOfZone, setOutOfZone] = useState(true);
    const [unassignedShipments, setUnassignedShipments] = useState<
        UnassignedShipment[]
    >((jobViewData?.data?.unassignedShipments as UnassignedShipment[]) || []);

    const jobs = jobViewData?.data?.value ?? [];

    const dispatchJobMuation = useDispatchJobs();
    const handleDispatchNow = () => {
        const payload: DispatchJobIdsPayload = {
            jobIds: dispatchJobs
        };
        dispatchJobMuation.mutate(payload, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t(
                            'job_dispatch.create_flow.alerts.dispatch_success'
                        )}
                    />
                ));
                router.push('/dashboard/job-dispatch');
            },
            onError: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={t(
                            'job_dispatch.create_flow.alerts.dispatch_failed'
                        )}
                    />
                ));
            }
        });
    };

    const handleDispatchLater = () => {
        router.push('/dashboard/job-dispatch');
    };

    // Out of Zone Shipments
    const manualAssignMutation = useManualAssign();
    const handleManualAssignDriver = (payload: AssignPayload) => {
        manualAssignMutation.mutate(payload, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t(
                            'job_dispatch.create_flow.alerts.assign_success'
                        )}
                    />
                ));
                setIsModifiedJob(true);
            },
            onError: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={t(
                            'job_dispatch.create_flow.alerts.assign_failed'
                        )}
                    />
                ));
            }
        });

        // reset
        setOpen(false);
        setSelectedJob(null);
    };

    const handleRemoveShipmentOutOfZone = (shipmentIds: string[]) => {
        setUnassignedShipments((prev) =>
            prev.filter((s) => !shipmentIds.includes(s.shipmentId))
        );

        toast.custom((t_id) => (
            <Toast
                toastId={t_id}
                status="success"
                description={t(
                    'job_dispatch.create_flow.alerts.remove_out_of_zone_success'
                )}
            />
        ));
    };

    // Job
    const changeDriverMutation = useChangeJobDriver();
    const handleChangeDriver = (payload: AssignPayload) => {
        changeDriverMutation.mutate(payload, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description={t(
                            'job_dispatch.create_flow.alerts.change_driver_success'
                        )}
                    />
                ));
                setIsModifiedJob(true);
            },
            onError: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={t(
                            'job_dispatch.create_flow.alerts.change_driver_failed'
                        )}
                    />
                ));
            }
        });

        // reset
        setOpen(false);
        setSelectedJob(null);
    };

    const removeShipmentMutation = useRemoveShipment();
    const handleRemoveShipmentOnJobSetting = ({
        jobId,
        shipmentIds
    }: {
        jobId: string;
        shipmentIds: string[];
    }) => {
        removeShipmentMutation.mutate(
            { jobId, shipmentIds },
            {
                onSuccess: () => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description={t(
                                'job_dispatch.create_flow.alerts.remove_shipment_success'
                            )}
                        />
                    ));
                    setIsModifiedJob(true);
                },
                onError: () => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="failed"
                            description={t(
                                'job_dispatch.create_flow.alerts.remove_shipment_failed'
                            )}
                        />
                    ));
                }
            }
        );
    };

    return (
        <div className="mx-4">
            <div
                className={cn(
                    'transition-all bg-white mb-4 rounded-lg flex flex-col h-full mt-4'
                )}
            >
                {outOfZone && unassignedShipments.length > 0 && (
                    <OutOfZoneAlert
                        count={unassignedShipments.length}
                        onClose={() => setOutOfZone(false)}
                    />
                )}
                <DraftShipmentCard
                    unassignedShipments={unassignedShipments}
                    jobs={jobs}
                    onAssign={handleManualAssignDriver}
                    handleRemoveShipment={handleRemoveShipmentOutOfZone}
                />
            </div>

            <div className="flex">
                <div
                    className={cn(
                        'transition-all bg-white rounded-lg flex flex-col h-full w-full'
                    )}
                >
                    <h2 className="font-bold text-xl text-gray-800 p-4">
                        {title ?? t('job_dispatch.create_flow.step_3.title')}
                    </h2>

                    {/* Job Dispatch List */}
                    <div className="flex-1 overflow-y-auto scrollbar max-h-[calc(100vh-280px)] [&::-webkit-scrollbar]:hidden">
                        {jobs.map((job) => (
                            <Accordion
                                key={job.jobId}
                                type="single"
                                collapsible
                                className="w-full"
                                defaultValue={isEditJob ? 'row' : undefined}
                                onValueChange={(value) => {
                                    if (value === 'row') {
                                        onSelectJobForMap(job);
                                    } else {
                                        onSelectJobForMap(null);
                                    }
                                }}
                            >
                                <AccordionItem
                                    value="row"
                                    className="group border-none rounded-md w-full"
                                >
                                    {/* HEADER ROW (NOT CLICKABLE) */}
                                    <div
                                        className="flex items-center justify-between gap-6 w-full px-4 py-3
                                            group-data-[state=open]:bg-blue-100
                                            group-data-[state=open]:text-blue-700
                                                group-data-[state=open]:font-semibold"
                                    >
                                        {/* LEFT SIDE */}
                                        <SelectDriver
                                            job={job}
                                            onAssign={(payload) =>
                                                handleChangeDriver(payload)
                                            }
                                        />

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t(
                                                    'job_dispatch.create_flow.step_3.stats.shipments'
                                                )}
                                            </p>
                                            <p className="font-semibold text-gray-900 text-sm pt-0.5">
                                                {job.shipmentIds?.length}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t(
                                                    'job_dispatch.details.stats.zone'
                                                )}
                                            </p>
                                            <p className="font-semibold text-gray-900 text-sm pt-0.5">
                                                {job.driver.zone.name}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
                                            >
                                                <Image
                                                    src="/icons/home.svg"
                                                    width={16}
                                                    height={16}
                                                    alt="home"
                                                />
                                            </Button>

                                            <AccordionTrigger
                                                onClick={() =>
                                                    onSelectJobForMap(job)
                                                }
                                                className="group flex items-center cursor-pointer [&>svg]:text-blue-600 group-data-[state=open]:[&>svg]:text-primary"
                                            ></AccordionTrigger>
                                        </div>
                                    </div>

                                    {/* Visits */}
                                    <AccordionContent className="pl-4 pb-4 relative">
                                        <div className="absolute top-6 bottom-0 left-7.5 border-l-2 border-dashed border-gray-300" />
                                        {job.visits.map((visit) => (
                                            <div
                                                key={visit.visitId}
                                                className="py-3 pl-3 relative"
                                            >
                                                <div className="absolute left-0 top-2 p-2 rounded-full bg-white border shadow">
                                                    <span className="w-3 h-3 rounded-full block bg-gray-500" />
                                                </div>

                                                <div className="pl-7 flex items-start gap-2">
                                                    {/* LEFT CONTENT */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div className="flex gap-2 items-center">
                                                                <p className="text-sm font-medium text-primary">
                                                                    {
                                                                        visit
                                                                            .tasks
                                                                            .length
                                                                    }{' '}
                                                                    {t(
                                                                        'job_dispatch.create_flow.step_3.stats.tasks'
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* Dialog */}
                                                            <SelectChangeDriver
                                                                open={open}
                                                                onOpenChange={
                                                                    setOpen
                                                                }
                                                                jobs={jobs}
                                                                shipmentIds={
                                                                    selectedJob?.shipmentIds ??
                                                                    []
                                                                }
                                                                onAssign={(
                                                                    payload
                                                                ) => {
                                                                    // task-level change
                                                                    handleChangeDriver(
                                                                        payload
                                                                    );
                                                                }}
                                                                onReset={() => {
                                                                    setSelectedJob(
                                                                        null
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <p className="text-sm pt-1.5">
                                                            {
                                                                visit.address
                                                                    .address
                                                            }
                                                        </p>

                                                        {/* TASK CARDS */}
                                                        <div className="mt-3 grid grid-cols-2 gap-3 w-full pr-6">
                                                            {visit.tasks.map(
                                                                (task) => (
                                                                    <div
                                                                        key={
                                                                            task.taskId
                                                                        }
                                                                        className="w-full border p-2 rounded-lg"
                                                                    >
                                                                        <div className="flex gap-2 justify-between">
                                                                            <div className="flex gap-2 items-center">
                                                                                <p className="text-sm font-medium text-primary">
                                                                                    {
                                                                                        task
                                                                                            .customerData
                                                                                            .customerName
                                                                                    }
                                                                                </p>
                                                                                <span className="border border-gray-300 px-1 rounded-xl bg-gray-50 text-gray-500 text-sm">
                                                                                    {task.type ===
                                                                                    'pickup'
                                                                                        ? t(
                                                                                              'job_dispatch.details.task_types.pick_up'
                                                                                          )
                                                                                        : t(
                                                                                              'job_dispatch.details.task_types.drop_off'
                                                                                          )}
                                                                                </span>
                                                                            </div>
                                                                            {/* <Setting /> */}
                                                                            <DropdownMenu
                                                                                modal={
                                                                                    false
                                                                                }
                                                                            >
                                                                                <DropdownMenuTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        aria-label="Open menu"
                                                                                        size="icon-sm"
                                                                                        className="cursor-pointer mr-3"
                                                                                    >
                                                                                        <EllipsisVertical />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>

                                                                                <DropdownMenuContent
                                                                                    className="w-40"
                                                                                    align="end"
                                                                                >
                                                                                    <DropdownMenuLabel>
                                                                                        {t(
                                                                                            'job_dispatch.create_flow.step_3.actions.title'
                                                                                        )}
                                                                                    </DropdownMenuLabel>
                                                                                    <Separator className="my-2" />
                                                                                    <DropdownMenuGroup>
                                                                                        {!isEditJob && (
                                                                                            <DropdownMenuItem
                                                                                                onSelect={() => {
                                                                                                    setSelectedJob(
                                                                                                        {
                                                                                                            jobId: job.jobId,
                                                                                                            shipmentIds:
                                                                                                                [
                                                                                                                    task.shipmentId
                                                                                                                ]
                                                                                                        }
                                                                                                    );
                                                                                                    setOpen(
                                                                                                        true
                                                                                                    );
                                                                                                }}
                                                                                                className="cursor-pointer"
                                                                                            >
                                                                                                {t(
                                                                                                    'job_dispatch.create_flow.step_3.actions.change_driver'
                                                                                                )}
                                                                                            </DropdownMenuItem>
                                                                                        )}
                                                                                        <DropdownMenuItem
                                                                                            onSelect={() =>
                                                                                                handleRemoveShipmentOnJobSetting(
                                                                                                    {
                                                                                                        jobId: job.jobId,
                                                                                                        shipmentIds:
                                                                                                            [
                                                                                                                task.shipmentId
                                                                                                            ]
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                            className="cursor-pointer"
                                                                                        >
                                                                                            {t(
                                                                                                'job_dispatch.create_flow.step_3.actions.remove_shipment'
                                                                                            )}
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuGroup>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>

                                                                        <p className="text-sm pt-1">
                                                                            {
                                                                                task
                                                                                    .customerData
                                                                                    .address
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm">
                                                                            {
                                                                                task
                                                                                    .customerData
                                                                                    .primaryPhoneNumber
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm">
                                                                            {t(
                                                                                'common.qty',
                                                                                {
                                                                                    count: task.itemQty
                                                                                }
                                                                            )}
                                                                        </p>
                                                                        <p className="text-sm">
                                                                            {t(
                                                                                'common.riel_format',
                                                                                {
                                                                                    amount: task.itemAmount
                                                                                }
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    'transition-all flex justify-between bg-white mt-4 p-4'
                )}
            >
                <Button
                    type="button"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => setCurrentStep(1)}
                >
                    <ArrowLeft size={18} /> {t('common.back')}
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={
                            isModifiedJob || unassignedShipments.length > 0
                        }
                        type="button"
                        className="text-primary bg-white border border-primary cursor-pointer"
                        onClick={handleDispatchLater}
                    >
                        {t(
                            'job_dispatch.create_flow.step_3.actions.dispatch_later'
                        )}
                    </Button>
                    <Button
                        variant="default"
                        disabled={
                            isModifiedJob || unassignedShipments.length > 0
                        }
                        type="button"
                        className="bg-primary text-white  cursor-pointer"
                        onClick={handleDispatchNow}
                    >
                        {t(
                            'job_dispatch.create_flow.step_3.actions.dispatch_now'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
