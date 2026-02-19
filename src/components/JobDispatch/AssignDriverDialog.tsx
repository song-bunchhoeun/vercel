'use client';

import React, { useState, useEffect } from 'react'; // 🚀 Added useState, useEffect
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/form';
import { Tally1, Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export interface AssignDriverProps {
    id: string;
    name: string;
    phone: string;
    zone?: string;
    avatar?: string;
}

interface AssignDriverDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drivers: AssignDriverProps[];
    totalSelectedShipment?: number;
    totalSelectedDriver?: number;
    isPending?: boolean;
}

export default function AssignDriverDialog({
    open,
    onOpenChange,
    drivers,
    totalSelectedShipment,
    totalSelectedDriver = 0,
    isPending: externalIsPending
}: AssignDriverDialogProps) {
    const { formState } = useFormContext();

    // 🚀 Track which button was clicked
    const [clickedAction, setClickedAction] = useState<
        'assign' | 'auto-assign' | null
    >(null);

    const isSubmitting = formState.isSubmitting || externalIsPending;

    // 🛡️ Reset the clicked action state when the dialog is closed
    useEffect(() => {
        if (!open) {
            setClickedAction(null);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-full max-w-none md:max-w-[925px] p-6 fixed z-[9999]"
                onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
                onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        Step 2: Assign Driver
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Select the available driver to deliver this shipment
                    </DialogDescription>
                </DialogHeader>

                <div
                    className={cn(
                        'bg-white p-4 rounded-2xl space-y-4 border border-gray-300 transition-opacity',
                        isSubmitting && 'opacity-70 pointer-events-none'
                    )}
                >
                    {/* DRIVER LIST */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
                        {drivers.map((driver) => (
                            <FormField
                                key={driver.id}
                                name="driverIds"
                                render={({ field }) => {
                                    const isChecked = field.value?.includes(
                                        driver.id
                                    );

                                    const toggle = () => {
                                        if (isSubmitting) return;
                                        const currentIds = field.value || [];
                                        field.onChange(
                                            isChecked
                                                ? currentIds.filter(
                                                      (id: string) =>
                                                          id !== driver.id
                                                  )
                                                : [...currentIds, driver.id]
                                        );
                                    };

                                    return (
                                        <Card
                                            onClick={toggle}
                                            className={cn(
                                                'rounded-lg bg-white shadow-none max-w-[250px] py-4 cursor-pointer border transition-all',
                                                isChecked
                                                    ? 'border-primary ring-1 ring-primary'
                                                    : 'border-gray-300',
                                                isSubmitting &&
                                                    'cursor-not-allowed border-gray-200'
                                            )}
                                        >
                                            <CardContent className="px-4 py-0">
                                                <div className="flex justify-between w-full">
                                                    <div className="flex gap-2">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage
                                                                src={
                                                                    driver.avatar ||
                                                                    '/driver-profile.svg'
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {driver.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {driver.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {driver.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        disabled={isSubmitting}
                                                        onCheckedChange={toggle}
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground p-1.5 bg-gray-100 rounded-sm mt-2">
                                                    Zone {driver.zone}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                }}
                            />
                        ))}
                    </div>

                    <Separator />

                    {/* FOOTER */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <p className="text-sm text-gray-700 pr-4">
                                Total Shipments:{' '}
                                <span className="text-primary font-bold">
                                    {totalSelectedShipment}
                                </span>
                            </p>
                            <Tally1 className="w-6 h-6 text-gray-300" />
                            <p className="text-sm text-gray-700">
                                Total Driver:{' '}
                                <span className="text-primary font-bold">
                                    {totalSelectedDriver}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="border border-gray-400 shadow-none text-gray-600 h-10"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Close
                            </Button>

                            {/* 🚀 ASSIGN BUTTON */}
                            <Button
                                type="submit"
                                form="create-job-dispatch"
                                onClick={() => setClickedAction('assign')} // 🎯 Set Action
                                disabled={
                                    totalSelectedDriver !== 1 || isSubmitting
                                }
                                className={cn(
                                    'h-10 min-w-[110px] gap-2',
                                    totalSelectedDriver !== 1 || isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary text-white cursor-pointer hover:bg-primary-hover'
                                )}
                            >
                                {isSubmitting && clickedAction === 'assign' ? ( // 🎯 Conditional Loading
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Assign'
                                )}
                            </Button>

                            {/* 🚀 AUTO ASSIGN BUTTON */}
                            <Button
                                type="submit"
                                form="create-job-dispatch"
                                onClick={() => setClickedAction('auto-assign')} // 🎯 Set Action
                                disabled={
                                    totalSelectedDriver <= 1 || isSubmitting
                                }
                                className={cn(
                                    'h-10 min-w-[140px] gap-2',
                                    totalSelectedDriver <= 1 || isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary text-white cursor-pointer hover:bg-primary-hover'
                                )}
                            >
                                {isSubmitting &&
                                clickedAction === 'auto-assign' ? ( // 🎯 Conditional Loading
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Auto Assign'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
