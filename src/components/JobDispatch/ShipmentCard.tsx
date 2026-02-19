'use client';

import {
    PARCEL_ADDRESS_STATUS,
    PARCEL_SYNC_STATUS,
    ShipmentCardData,
    SHIPMENT_TASK_TYPE
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { Currency } from '@/app/dashboard/shipments/(form)/shipment.form.service';
import { CurrencyType } from '@/app/dashboard/shipments/bulk/bulk.form.service';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ShipmentCard({ shipments }: { shipments: ShipmentCardData[] }) {
    return (
        <div className="space-y-2">
            {shipments.map((item, index) => {
                const hasGeo =
                    item.address.status ===
                        PARCEL_ADDRESS_STATUS.CUSTOMER_PROVIDED ||
                    item.address.status === PARCEL_ADDRESS_STATUS.SUCCESS;
                const showCheckbox =
                    hasGeo && item.syncStatus === PARCEL_SYNC_STATUS.SYNCED;
                return (
                    <div key={item.id}>
                        <Card className="border-none shadow-none px-4 py-2 hover:bg-neutral-50/50 transition-colors">
                            <CardContent className="p-0 flex gap-4">
                                {showCheckbox ? (
                                    <FormField
                                        name="shipmentIds"
                                        render={({ field }) => (
                                            <Checkbox
                                                className="mt-1.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                                                checked={field.value.includes(
                                                    item.dpShipmentId
                                                )}
                                                onCheckedChange={(v) => {
                                                    const next = v
                                                        ? [
                                                              ...field.value,
                                                              item.dpShipmentId
                                                          ]
                                                        : field.value.filter(
                                                              (id: string) =>
                                                                  id !==
                                                                  item.dpShipmentId
                                                          );
                                                    field.onChange(next);
                                                }}
                                            />
                                        )}
                                    />
                                ) : null}

                                <div
                                    className={cn(
                                        'flex-1 text-sm',
                                        !showCheckbox && 'ml-8'
                                    )}
                                >
                                    <div className="flex gap-2 items-center mb-1">
                                        <p className="font-normal text-primary">
                                            {item.name}
                                        </p>
                                        <span className="text-[12px] font-normal px-2 py-0.5 bg-neutral-100 rounded-full text-gray border border-neutral-200">
                                            {item.taskType ===
                                            SHIPMENT_TASK_TYPE.DropOff
                                                ? 'Drop-Off'
                                                : 'Pick-Up'}
                                        </span>
                                    </div>
                                    {item.syncStatus ===
                                        PARCEL_SYNC_STATUS.FAILED && (
                                        <span className="text-destructive">
                                            Failure
                                        </span>
                                    )}
                                    {![
                                        PARCEL_SYNC_STATUS.SYNCED,
                                        PARCEL_SYNC_STATUS.FAILED
                                    ].includes(item.syncStatus) && (
                                        <span className="text-warning-500">
                                            Pending
                                        </span>
                                    )}

                                    {hasGeo ? (
                                        <p className="text-gray text-[14px] leading-tight">
                                            {item.address.line}
                                        </p>
                                    ) : (
                                        <div className="text-[14px] font-medium leading-snug">
                                            <AlertCircle className="w-4 h-4 text-red-500 float-left mr-2" />
                                            <span className="text-red-500">
                                                Address not found
                                            </span>
                                            <span className="text-gray-400 mx-1">
                                                |
                                            </span>
                                            <span>{item.address.line}</span>
                                        </div>
                                    )}
                                    <p className="text-gray mt-0.5 text-[14px]">
                                        {item.primaryPhone}
                                        {item.secondaryPhone &&
                                            `, ${item.secondaryPhone}`}
                                    </p>
                                    <div className="flex gap-4 mt-1 font-normal text-[14px] tracking-tighter">
                                        <span>{item.qty} Qty</span>
                                    </div>
                                    <div className="flex gap-4 mt-1 font-normal text-[14px] tracking-tighter">
                                        <span>
                                            {item.amount?.toLocaleString()}{' '}
                                            {item.currencyType === Currency.khr
                                                ? CurrencyType.RIEL
                                                : CurrencyType.DOLLAR}
                                        </span>
                                    </div>
                                    {item.note && (
                                        <p className="text-xs text-primary mt-2 italic font-medium text-[12px]">
                                            Note:{' '}
                                            <span className="text-gray-800 not-italic">
                                                {item.note}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {index < shipments.length - 1 && (
                            <Separator className=" bg-neutral-200" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
