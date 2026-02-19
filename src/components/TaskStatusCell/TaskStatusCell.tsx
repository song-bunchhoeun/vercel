'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    TaskStatus
} from '@/app/dashboard/shipments/(form)/shipment.form.service';
import { getAvailableStatusOptions, getStatusMeta } from '@/data/filter';
import { useUpdateShipmentStatus } from '@/hooks/useShipments';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import Toast from '@/components/common/toast/Toast';
import { toast } from 'sonner';
import ShipmentFailedReasonDialog from './ShipmentReason';

interface TaskStatusCellProps {
    id: string;
    status: number;
    taskType: number;
    isEditable: boolean;
}

export function TaskStatusCell({
    id,
    status,
    taskType,
    isEditable
}: TaskStatusCellProps) {
    const statusOptions = getAvailableStatusOptions(taskType, status);
    const meta = getStatusMeta(status);

    const [open, setOpen] = useState(false);
    const [reasonsDialogOpen, setReasonsDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(status);

    const { mutate: updateStatus, isPending } = useUpdateShipmentStatus();

    useEffect(() => {
        setSelectedStatus(status);
    }, [status]);

    const handleSaveStatus = (newStatus: TaskStatus, reason?: string) => {
        updateStatus(
            { id, status: newStatus, note: reason },
            {
                onSuccess: () => {
                    setOpen(false);
                    setReasonsDialogOpen(false);
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="success"
                            description="Status updated successfully."
                        />
                    ));
                }
            }
        );
    };

    const handleInitialSave = () => {
        if (selectedStatus === TaskStatus.Failed) {
            setReasonsDialogOpen(true);
            setOpen(false); // Close the status popover to show the dialog
            return;
        }
        handleSaveStatus(selectedStatus);
    };

    if (!isEditable || statusOptions.length === 0) {
        return (
            <div className="flex items-center gap-2 py-1">
                <div className={cn('h-2 w-2 rounded-full', meta.color)} />
                <span className="text-[14px] font-medium">{meta.display}</span>
            </div>
        );
    }

    return (
        <>
            <Popover
                open={open}
                onOpenChange={(v) => {
                    if (!isPending) {
                        if (!v) setSelectedStatus(status);
                        setOpen(v);
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            'flex items-center gap-2 px-2 py-1 rounded-md border hover:border-neutral-200 transition-all cursor-pointer group',
                            isPending && 'opacity-50 pointer-events-none'
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={cn(
                                'h-2 w-2 rounded-full',
                                getStatusMeta(selectedStatus).color
                            )}
                        />
                        <span className="text-[14px] font-medium text-neutral-700 group-hover:text-primary transition-colors">
                            {getStatusMeta(selectedStatus).display}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-48 p-0 z-[1005]"
                    onClick={(e) => e.stopPropagation()}
                    align="start"
                >
                    <div className="flex flex-col">
                        <span className="px-3 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                            Update Status
                        </span>
                        <Separator />
                        <div className="p-1 space-y-0.5">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={cn(
                                        'w-full text-left px-3 py-2 rounded-md text-[14px] flex justify-between items-center transition-colors hover:bg-neutral-50',
                                        selectedStatus === opt.value &&
                                            'bg-neutral-50 font-bold text-primary'
                                    )}
                                    onClick={() =>
                                        setSelectedStatus(
                                            opt.value as TaskStatus
                                        )
                                    }
                                >
                                    <div className="flex gap-2 items-center">
                                        <div
                                            className={cn(
                                                'h-2 w-2 rounded-full',
                                                opt.color
                                            )}
                                        />
                                        <span>{opt.display}</span>
                                    </div>
                                    {selectedStatus === opt.value && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <Separator />
                        <div className="flex justify-end gap-2 p-2 bg-neutral-50/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedStatus(status);
                                    setOpen(false);
                                }}
                                className="h-8 text-[12px] border"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleInitialSave}
                                disabled={
                                    isPending || selectedStatus === status
                                }
                                className="h-8 text-[12px] px-4 font-bold"
                            >
                                {isPending ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <ShipmentFailedReasonDialog
                open={reasonsDialogOpen}
                onOpenChange={setReasonsDialogOpen}
                onSubmit={(reason) =>
                    handleSaveStatus(TaskStatus.Failed, reason)
                }
            />
        </>
    );
}
