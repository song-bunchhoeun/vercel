'use client';

import React, { useState } from 'react';
import { EllipsisVertical, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AssignDriverDialog from './AssignDriverDialog';
import { DriverCardData } from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';

interface ChangeDriverDropdownProps {
    shipmentId: string;
    // You would pass drivers here or fetch them inside the dialog
    drivers?: DriverCardData[];
}

export default function ChangeDriverDropdown({
    shipmentId,
    drivers = []
}: ChangeDriverDropdownProps) {
    const [openAssignDialog, setOpenAssignDialog] = useState(false);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray hover:text-primary hover:bg-neutral-100 cursor-pointer rounded-lg"
                    >
                        <EllipsisVertical size={18} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-48 rounded-xl shadow-xl border-neutral-100 z-[10002]"
                    align="end"
                >
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 pt-3">
                        Shipment Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2 bg-neutral-100" />

                    <DropdownMenuGroup className="p-1">
                        <DropdownMenuItem
                            onSelect={() => setOpenAssignDialog(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium"
                        >
                            <UserPlus size={16} className="text-primary" />
                            Change Driver
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() =>
                                console.log('Remove shipment:', shipmentId)
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Remove Shipment
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Reassignment Dialog */}
            {openAssignDialog && (
                <AssignDriverDialog
                    open={openAssignDialog}
                    onOpenChange={setOpenAssignDialog}
                    drivers={drivers}
                    totalSelectedShipment={1}
                    totalSelectedDriver={0} // Logic to be handled by your form state
                />
            )}
        </>
    );
}
