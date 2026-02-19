'use client';

import {
    AddressStatus,
    Currency,
    TaskType
} from '@/app/dashboard/shipments/(form)/shipment.form.service';
import AddressMapDialog from '@/components/AddressMapDialog/address-map.dialog';
import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getStatusMeta } from '@/data/filter';
import { useGetShipmentDetail } from '@/hooks/useShipments';
import { getFormattedDate } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import {
    CircleAlert,
    Loader2,
    LocateFixed,
    LucideTrash2,
    SquarePen
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ShipmentViewDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedId: string;
    onDelete?: (id: string) => void;
}

export default function ShipmentViewDetails({
    open,
    onOpenChange,
    selectedId,
    onDelete
}: ShipmentViewDetailsProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [openMap, setOpenMap] = useState(false);
    const [activeTab, setActiveTab] = React.useState<'information' | 'history'>(
        'information'
    );

    const { data, isLoading } = useGetShipmentDetail(selectedId);
    const shipmentHistory = data;
    const status = data?.status;
    const meta = getStatusMeta(status);

    const isInvalidAddress =
        data?.address.status === AddressStatus.NotFound ||
        data?.address.status === AddressStatus.Invalid;

    const handleEdit = () => {
        if (isNavigating || !data?.id) return;
        setIsNavigating(true);
        router.push(`/dashboard/shipments/edit/${data.id}`);
    };

    const dialogContent: BaseViewDetailsDialogContent = {
        title: t('shipments.view_details.title'),
        text: t('shipments.view_details.view_text'),
        actions: (
            <div
                className={cn(
                    status === 1 && 'flex justify-between w-full items-center'
                )}
            >
                {status === 1 && (
                    <div className="flex h-5 justify-center items-center">
                        <Button
                            variant="ghost"
                            onClick={() => data?.id && onDelete?.(data.id)}
                            className="cursor-pointer"
                        >
                            <LucideTrash2 className="text-danger" />
                        </Button>
                        <Separator orientation="vertical" className="h-full" />
                        <Button
                            variant="ghost"
                            onClick={handleEdit}
                            className="cursor-pointer"
                            disabled={isNavigating}
                        >
                            <Link
                                onClick={(e) => e.stopPropagation()}
                                href={`/dashboard/shipments/edit/${data?.id}`}
                            >
                                {isNavigating ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                ) : (
                                    <SquarePen className="text-primary" />
                                )}
                            </Link>
                        </Button>
                    </div>
                )}
                <Button
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer text-sm px-3 sm:px-4"
                >
                    {t('shipments.view_details.close')}
                </Button>
            </div>
        )
    };

    return (
        <>
            <BaseViewDialog
                isOpen={open}
                onOpenChange={onOpenChange}
                dialogContent={dialogContent}
                dialogMaxWidth="sm:max-w-[640px]"
            >
                {/* Tabs */}
                <div className="flex gap-6 font-medium text-sm">
                    <button
                        onClick={() => setActiveTab('information')}
                        className={cn(
                            'pb-1 cursor-pointer transition-colors',
                            activeTab === 'information'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-700 hover:text-primary'
                        )}
                    >
                        {t('shipments.view_details.tabs.info')}
                    </button>

                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            'pb-1 cursor-pointer transition-colors',
                            activeTab === 'history'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-700 hover:text-primary'
                        )}
                    >
                        {t('shipments.view_details.tabs.history')}
                    </button>
                </div>
                <Separator className="my-4" />

                {isLoading && (
                    <div className="justify-center flex py-10">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}

                {/* Customer Info Panel */}
                {!isLoading && data && activeTab === 'information' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">
                                {t(
                                    'shipments.view_details.info.customer_title'
                                )}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4">
                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.customer_name'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.customer.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.shipment_id'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.created_date'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.date
                                            ? getFormattedDate(data.date)
                                            : t('common.not_available')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.primary_phone'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.customer.primaryPhone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.secondary_phone'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.customer.secondaryPhone || '—'}
                                    </p>
                                </div>

                                <div className="sm:col-span-3">
                                    <div className="flex gap-1.5 items-center">
                                        <p className="text-gray text-xs font-sans">
                                            {t(
                                                'shipments.view_details.info.delivery_address'
                                            )}
                                        </p>
                                        <LocateFixed
                                            onClick={() => setOpenMap(true)}
                                            className="w-4 h-4 text-primary cursor-pointer hover:text-primary"
                                        />
                                    </div>
                                    <div className="flex flex-wrap font-medium text-sm gap-y-1 gap-x-3 items-start">
                                        {isInvalidAddress && (
                                            <div className="flex text-destructive whitespace-nowrap gap-1.5 items-center border-r border-gray-300 pr-3 last:border-r-0">
                                                <CircleAlert className="h-4 w-4" />
                                                <span>
                                                    {t(
                                                        'shipments.view_details.info.address_not_found'
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <p className="flex-1">
                                            {data.address.line}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 mt-4">
                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.parcel_qty'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.item.qty}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.amount'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.item.amount}{' '}
                                        {data.item.currencyType === Currency.khr
                                            ? t(
                                                  'shipments.form.sections.delivery.riel'
                                              )
                                            : t(
                                                  'shipments.form.sections.delivery.dollar'
                                              )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.task_type'
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.taskType === TaskType.DropOff
                                            ? t(
                                                  'shipments.form.sections.delivery.drop_off'
                                              )
                                            : t(
                                                  'shipments.form.sections.delivery.pick_up'
                                              )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray text-xs font-sans">
                                        {t(
                                            'shipments.view_details.info.status'
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                'h-2 w-2 rounded-full',
                                                meta.color
                                            )}
                                        />
                                        <span className="text-sm font-medium">
                                            {t(meta.translateKey!)}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-gray text-xs font-sans">
                                        {t('shipments.view_details.info.note')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {data.note || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {status && ![1, 2, 3].includes(status) && (
                            <>
                                <Separator className="my-4" />
                                {status === 6 && (
                                    <div className="mb-4">
                                        <p className="text-gray text-xs font-sans">
                                            {t(
                                                'shipments.view_details.info.driver_notes'
                                            )}
                                        </p>
                                        <p className="text-sm font-medium text-red-600">
                                            {data.note ||
                                                t(
                                                    'shipments.view_details.info.no_reason'
                                                )}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-gray text-xs font-sans mt-4 mb-3">
                                        {t(
                                            'shipments.view_details.info.driver_photos'
                                        )}
                                    </p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {shipmentHistory?.dropoff?.photos?.map(
                                            (photo, index) =>
                                                photo.photoUrl?.trim() && (
                                                    <Image
                                                        key={index}
                                                        src={photo.photoUrl}
                                                        alt="Driver upload"
                                                        width={65}
                                                        height={65}
                                                        className="rounded-lg w-16 h-16 object-cover border border-gray-200"
                                                    />
                                                )
                                        )}

                                        {/* Empty state */}
                                        {!shipmentHistory?.dropoff?.photos?.some(
                                            (photo) => photo.photoUrl?.trim()
                                        ) && (
                                            <p className="text-sm text-gray-500 italic">
                                                {t(
                                                    'shipments.view_details.info.no_photos'
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* History Panel */}
                {!isLoading && data && activeTab === 'history' && (
                    <div className="space-y-6 py-2">
                        {shipmentHistory?.history?.length ? (
                            shipmentHistory.history.map((history, index) => (
                                <div
                                    key={index}
                                    className="relative border-l-2 border-neutral-100 last:border-l-0 pb-6 last:pb-0"
                                >
                                    <p className="text-sm font-bold ">
                                        {history.date
                                            ? getFormattedDate(
                                                  history.date,
                                                  'YYYY-MM-DD HH:mm:ss a'
                                              )
                                            : t('common.not_available')}
                                    </p>
                                    <div className="flex gap-1 text-gray text-xs font-sans mt-1">
                                        <div className="flex gap-1 items-center">
                                            <p className="font-semibold text-secondary-foreground">
                                                {history.title}
                                            </p>
                                            <Separator
                                                orientation="vertical"
                                                className="h-3 mx-1"
                                            />
                                        </div>
                                        <p>{history.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-64 flex flex-col justify-center items-center gap-4">
                                <Image
                                    src="/nodata/no-shipment-history.svg"
                                    width={100}
                                    height={100}
                                    alt="No history"
                                    className="opacity-50"
                                />
                                <p className="text-gray-700 text-sm font-bold">
                                    {t(
                                        'shipments.view_details.history.no_history'
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </BaseViewDialog>

            {/* Address Map Dialog Integration */}
            <AddressMapDialog
                open={openMap}
                setOpen={setOpenMap}
                isViewMap={true}
                title={t('shipments.view_details.info.delivery_address')}
                latitude={data?.address.latitude}
                longitude={data?.address.longitude}
                defaultAddress={data?.address.line}
            />
        </>
    );
}
