'use client';

import AddressMapDialog from '@/components/AddressMapDialog/address-map.dialog';
import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Edit, LocateFixed, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { WarehouseDocument } from './(form)/warehouse.form.service';
import Image from 'next/image';
import { useGetWarehouseDetail } from '@/hooks/useWarehouses';
import { getWHStatusColor } from '@/lib/warehouse-status';
import { cn } from '@/lib/utils';
import { getFormattedDate } from '@/lib/dayjs';
import { useTranslation } from 'react-i18next';

interface WarehouseViewDetailsProps {
    warehouseId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WarehouseViewDetails({
    warehouseId,
    open,
    onOpenChange
}: WarehouseViewDetailsProps) {
    const { t } = useTranslation();
    const [openMap, setOpenMap] = useState(false);

    // 1. Fetch data (Only when dialog is open)
    const { data: warehouse, isLoading } = useGetWarehouseDetail(warehouseId);

    const docs: WarehouseDocument[] = warehouse?.documents ?? [];

    // 3. Early loading return (Keep BaseViewDialog open to avoid "disappearing" modal)
    const dialogContent: BaseViewDetailsDialogContent = {
        title: t('warehouses.view_details.title'),
        text: t('warehouses.view_details.view_text'),
        actions: (
            <div className="flex justify-between w-full items-center">
                <div className="flex items-center">
                    {warehouse && (
                        <Link
                            href={`/dashboard/warehouse/edit/${warehouse.id}`}
                        >
                            <Edit
                                size={20}
                                strokeWidth={1.5}
                                className="cursor-pointer text-primary hover:text-hover transition-colors"
                            />
                        </Link>
                    )}
                </div>
                <DialogClose asChild>
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="cursor-pointer px-4"
                    >
                        {t('warehouses.view_details.close')}
                    </Button>
                </DialogClose>
            </div>
        )
    };

    return (
        <>
            <BaseViewDialog
                isOpen={open}
                onOpenChange={onOpenChange}
                dialogContent={dialogContent}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">
                            {t('warehouses.view_details.fetching')}
                        </p>
                    </div>
                ) : warehouse ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 lg:max-w-100">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {t('warehouses.view_details.name')}
                                </p>
                                <p className="text-sm sm:text-base font-medium">
                                    {warehouse.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {t('warehouses.view_details.created_date')}
                                </p>
                                <p className="text-sm sm:text-base font-medium">
                                    {getFormattedDate(warehouse.createDate)}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="flex gap-1.5 items-center mb-1">
                                    <p className="text-gray-500 text-xs sm:text-sm">
                                        {t('warehouses.view_details.address')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setOpenMap(true)}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <LocateFixed className="w-4 h-4 text-primary" />
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base font-medium leading-relaxed">
                                    {warehouse.address}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {t('warehouses.view_details.primary_phone')}
                                </p>
                                <p className="text-sm sm:text-base font-medium">
                                    {warehouse.primaryPhone}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {t(
                                        'warehouses.view_details.secondary_phone'
                                    )}
                                </p>
                                <p className="text-sm sm:text-base font-medium">
                                    {warehouse.secondaryPhone || '-'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs sm:text-sm mb-1">
                                {t('warehouses.view_details.status')}
                            </p>
                            <div className="flex items-center gap-2">
                                <StatusLabel status={warehouse.status} />
                            </div>
                        </div>

                        {docs.length > 0 && (
                            <div className="pt-2">
                                <Separator className="mb-4" />
                                <p className="text-sm text-gray-500 mb-3">
                                    {t('warehouses.view_details.images')} (
                                    {docs.length})
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {docs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="relative group"
                                        >
                                            <Image
                                                src={doc.url}
                                                width={100}
                                                height={100}
                                                alt={doc.name}
                                                className="rounded-lg w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-100 shadow-sm transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center py-10 text-gray-500">
                        {t('warehouses.view_details.not_found')}
                    </p>
                )}
            </BaseViewDialog>

            {/* Map Dialog (View Only) */}
            {warehouse && (
                <AddressMapDialog
                    open={openMap}
                    setOpen={setOpenMap}
                    isViewMap={true}
                    latitude={warehouse.latitude}
                    longitude={warehouse.longitude}
                    defaultAddress={warehouse.address}
                    title={t('warehouses.view_details.location_title')}
                />
            )}
        </>
    );
}

const StatusLabel = ({ status }: { status: number }) => {
    const statusObj = getWHStatusColor(status);
    return (
        <span
            className={cn(
                `text-sm sm:text-base font-medium`,
                statusObj.textClass
            )}
        >
            {statusObj.label}
        </span>
    );
};
