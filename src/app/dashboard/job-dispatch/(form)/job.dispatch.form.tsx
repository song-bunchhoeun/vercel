'use client';

import React, { Dispatch, SetStateAction, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    UserPlus,
    PackageCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';

// Components
import AssignDriverDialog from '@/components/JobDispatch/AssignDriverDialog';
import { ShipmentCard } from '@/components/JobDispatch/ShipmentCard';
import { TaskTypeMultiSelect } from '@/components/JobDispatch/TaskTypeMultiSelect';
import BaseForm from '@/components/BaseForm/BaseForm';
import { FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming standard Shadcn Skeleton

// Service & Utils
import { cn } from '@/lib/utils';
import {
    JobDispatchDefaultValues,
    JobDispatchRequest,
    JobDispatchSchema,
    Step,
    TASK_TYPE_OPTIONS,
    ShipmentCardData,
    DriverCardData,
    PARCEL_ADDRESS_STATUS,
    PARCEL_SYNC_STATUS
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { TaskStatus } from '@/app/dashboard/shipments/(form)/shipment.form.service';

interface JobDispatchFormProps {
    currentStep: Step;
    setCurrentStep: Dispatch<SetStateAction<Step>>;
    shipments: ShipmentCardData[];
    drivers: DriverCardData[];
    onChangeType: (type: number[]) => void;
    isLoading: boolean;
    onFormValid: (formData: JobDispatchRequest) => void;
    isPending: boolean; // 🚀 Received from Orchestrator
}

export default function JobDispatchForm({
    currentStep,
    setCurrentStep,
    shipments,
    drivers,
    isLoading,
    onChangeType,
    onFormValid,
    isPending
}: JobDispatchFormProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'new' | 'failed'>('new');
    const [taskTypes, setTaskTypes] = useState<number[]>([]);
    const [selectedCounts, setSelectedCounts] = useState({
        shipments: 0,
        drivers: 0
    });

    // 1. SHIPMENT FILTERING LOGIC
    const filteredByStatus = useMemo(
        () => ({
            new: shipments.filter((s) => s.status === TaskStatus.New),
            failed: shipments.filter((s) => s.status === TaskStatus.Failed)
        }),
        [shipments]
    );

    const displayShipments = useMemo(() => {
        const pool =
            activeTab === 'new'
                ? filteredByStatus.new
                : filteredByStatus.failed;
        return taskTypes.length === 0
            ? pool
            : pool.filter((s) => taskTypes.includes(s.taskType));
    }, [activeTab, filteredByStatus, taskTypes]);

    const selectableShipmentIds = useMemo(() => {
        return displayShipments
            .filter((s) => {
                const hasGeo =
                    s.address.status ===
                        PARCEL_ADDRESS_STATUS.CUSTOMER_PROVIDED ||
                    s.address.status === PARCEL_ADDRESS_STATUS.SUCCESS;

                return hasGeo && s.syncStatus === PARCEL_SYNC_STATUS.SYNCED;
            })
            .map((s) => s.dpShipmentId);
    }, [displayShipments]);

    return (
        <BaseForm
            id="create-job-dispatch"
            schema={JobDispatchSchema}
            defaultValues={JobDispatchDefaultValues}
            onValid={onFormValid}
            onChange={(data) => {
                setSelectedCounts({
                    shipments: data.shipmentIds?.length || 0,
                    drivers: data.driverIds?.length || 0
                });
            }}
        >
            <div className="w-full relative min-h-[calc(100vh-200px)]">
                {currentStep !== 3 && (
                    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mx-4 mt-4">
                        {/* HEADER */}
                        <div className="p-6 border-b border-neutral-100">
                            <h1 className="font-bold text-2xl text-black tracking-tight">
                                {t('job_dispatch.create_flow.step_1.title')}
                            </h1>
                        </div>

                        {/* FILTERS & TABS */}
                        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-1 p-1 rounded-xl w-fit">
                                <TabButton
                                    active={activeTab === 'new'}
                                    onClick={() => setActiveTab('new')}
                                    label={t(
                                        'job_dispatch.create_flow.step_1.tabs.new'
                                    )}
                                    count={filteredByStatus.new.length}
                                    icon={<PackageCheck size={14} />}
                                />
                                <TabButton
                                    active={activeTab === 'failed'}
                                    onClick={() => setActiveTab('failed')}
                                    label={t(
                                        'job_dispatch.create_flow.step_1.tabs.failed'
                                    )}
                                    count={filteredByStatus.failed.length}
                                    icon={<AlertCircle size={14} />}
                                />
                            </div>

                            <TaskTypeMultiSelect
                                options={TASK_TYPE_OPTIONS}
                                value={taskTypes}
                                onChange={(types) => {
                                    setTaskTypes(types);
                                    onChangeType(types);
                                }}
                            />
                        </div>

                        {/* SELECT ALL BAR */}
                        <div className="px-8 py-3 bg-white border-b border-neutral-100 flex items-center gap-3">
                            <FormField
                                name="shipmentIds"
                                render={({ field }) => {
                                    const allChecked =
                                        selectableShipmentIds.length > 0 &&
                                        selectableShipmentIds.every((id) =>
                                            field.value.includes(id)
                                        );
                                    return (
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="select-all"
                                                checked={allChecked}
                                                disabled={
                                                    isLoading ||
                                                    selectableShipmentIds.length ===
                                                        0
                                                }
                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                onCheckedChange={(checked) => {
                                                    const clean =
                                                        field.value.filter(
                                                            Boolean
                                                        );

                                                    const otherSelections =
                                                        clean.filter(
                                                            (id: string) =>
                                                                !selectableShipmentIds.includes(
                                                                    id
                                                                )
                                                        );

                                                    const nextValue = checked
                                                        ? [
                                                              ...otherSelections,
                                                              ...selectableShipmentIds
                                                          ]
                                                        : otherSelections;

                                                    field.onChange(nextValue);
                                                }}
                                            />
                                            <label
                                                htmlFor="select-all"
                                                className="text-xs font-normal text-primary uppercase tracking-wider cursor-pointer"
                                            >
                                                {t(
                                                    'job_dispatch.create_flow.step_1.select_all',
                                                    {
                                                        tab: t(
                                                            `job_dispatch.create_flow.step_1.tabs.${activeTab}`
                                                        )
                                                    }
                                                )}
                                            </label>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* SHIPMENT LIST AREA WITH LOADING STATE */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[60vh] relative min-h-[300px]">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="flex gap-4 p-4 border border-neutral-100 rounded-xl"
                                        >
                                            <Skeleton className="h-5 w-5 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <div className="bg-white p-3 rounded-full shadow-xl border border-neutral-100">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ShipmentCard shipments={displayShipments} />
                            )}
                        </div>

                        {/* STICKY FOOTER */}
                        <div className="p-6 bg-white border-t border-neutral-100 flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                className="font-normal text-black hover:text-primary gap-2 cursor-pointer"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft size={18} /> {t('common.back')}
                            </Button>

                            <div className="flex items-center gap-6">
                                <Button
                                    type="button"
                                    disabled={
                                        selectedCounts.shipments === 0 ||
                                        isLoading
                                    }
                                    onClick={() => setCurrentStep(2)}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl h-11 gap-2 cursor-pointer"
                                >
                                    <UserPlus size={18} />{' '}
                                    {t(
                                        'job_dispatch.create_flow.footer.assign_btn'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL STEP 2 */}
                <AssignDriverDialog
                    drivers={drivers}
                    open={currentStep === 2}
                    onOpenChange={(open) => !open && setCurrentStep(1)}
                    totalSelectedShipment={selectedCounts.shipments}
                    totalSelectedDriver={selectedCounts.drivers}
                    isPending={isPending} // 🚀 Pass it down here
                />
            </div>
        </BaseForm>
    );
}

//eslint-disable-next-line
function TabButton({ active, onClick, label, count, icon }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 mx-4 py-2 rounded-lg text-[14px] font-normal transition-all cursor-pointer',
                active
                    ? 'bg-white text-primary border-b rounded-none border-primary'
                    : 'text-gray'
            )}
        >
            {icon}
            {label}
            <span
                className={cn(
                    'ml-1 min-w-[24px] h-6 flex items-center justify-center rounded-full text-[14px]',
                    active
                        ? 'bg-primary-100 text-primary'
                        : 'bg-neutral-200 text-gray'
                )}
            >
                {count}
            </span>
        </button>
    );
}
