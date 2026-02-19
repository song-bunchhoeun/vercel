'use client';

import {
    Job,
    SHIPMENT_TASK_TYPE,
    UnassignedShipment
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { AssignPayload } from '@/app/dashboard/job-dispatch/(form)/JobDriverConfirmation';
import Toast from '@/components/common/toast/Toast';
import SelectChangeDriver from '@/components/JobDispatch/SelectChangeDriver';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DraftShipmentCardProps {
    unassignedShipments: UnassignedShipment[];
    jobs: Job[];
    onAssign: (payload: AssignPayload) => void;
    handleRemoveShipment: (shipmentIds: string[]) => void;
}

export default function DraftShipmentCard({
    unassignedShipments,
    jobs,
    onAssign,
    handleRemoveShipment
}: DraftShipmentCardProps) {
    const [assignShipmentIds, setAssignShipmentIds] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const [showAll, setShowAll] = useState(false);
    const displayedShipments = showAll
        ? unassignedShipments
        : unassignedShipments.slice(0, 2);

    const toggleShipment = (id: string) => {
        setAssignShipmentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleOpenAssign = () => {
        setOpen(true);
    };

    return (
        <>
            <div
                className={`${showAll ? 'max-h-96 overflow-y-auto transition-all' : ''}`}
            >
                {displayedShipments.map((item, index) => (
                    <div key={item.shipmentId}>
                        <div className="flex py-2 pr-4">
                            <Card className="rounded-lg shadow-none w-full px-4 py-0 border-none">
                                <CardContent className="p-0">
                                    <div className="flex gap-4 w-full">
                                        <Checkbox
                                            checked={assignShipmentIds.includes(
                                                item?.shipmentId
                                            )}
                                            onCheckedChange={() =>
                                                toggleShipment(item?.shipmentId)
                                            }
                                            className="mt-1 border border-gray-300
                                        data-[state=checked]:bg-primary
                                        data-[state=checked]:border-primary"
                                        />

                                        <div className="text-sm w-full">
                                            <div className="flex justify-between">
                                                <div className="flex gap-2 items-center">
                                                    <p className="font-medium text-primary">
                                                        {item?.shipment
                                                            ?.customer?.name ??
                                                            ''}
                                                    </p>
                                                    <span className="border px-2 rounded-lg bg-gray-50 text-gray-500">
                                                        {item?.shipment
                                                            ?.taskType ===
                                                        SHIPMENT_TASK_TYPE.DropOff
                                                            ? 'Drop-Off'
                                                            : 'Pick-Up'}
                                                    </span>
                                                </div>
                                            </div>

                                            <p>
                                                {item?.shipment?.address?.line}
                                            </p>
                                            <p>
                                                {item?.shipment?.customer
                                                    ?.primaryPhone ?? ''}
                                                {', '}{' '}
                                                {item?.shipment?.customer
                                                    ?.secondaryPhone ?? ''}
                                            </p>
                                            <p>
                                                {item?.shipment?.item?.qty} qty
                                            </p>
                                            <p>
                                                {item?.shipment?.item?.amount}{' '}
                                                Riel (៛)
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="cursor-pointer"
                                    >
                                        <EllipsisVertical />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                >
                                    <DropdownMenuLabel>
                                        Setting
                                    </DropdownMenuLabel>
                                    <Separator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onSelect={handleOpenAssign}
                                        >
                                            Assing Driver
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => {
                                                if (
                                                    assignShipmentIds.length ===
                                                    0
                                                ) {
                                                    toast.custom((t) => (
                                                        <Toast
                                                            toastId={t}
                                                            status="failed"
                                                            description="Please select at least one shipment."
                                                        />
                                                    ));
                                                    return;
                                                }

                                                handleRemoveShipment(
                                                    assignShipmentIds
                                                );
                                                setAssignShipmentIds([]);
                                            }}
                                        >
                                            Remove Shipment
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index < displayedShipments.length - 1 && <Separator />}
                    </div>
                ))}

                {unassignedShipments.length > 2 && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-xs text-center p-4 w-full cursor-pointer rounded-t-none"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            </div>

            {/* DRIVER DIALOG */}
            <SelectChangeDriver
                open={open}
                onOpenChange={setOpen}
                jobs={jobs}
                shipmentIds={assignShipmentIds}
                onAssign={onAssign}
                onReset={() => setAssignShipmentIds([])}
            />
        </>
    );
}
