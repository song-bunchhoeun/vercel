'use client';

import { DriverResponseData } from '@/app/dashboard/driver/(form)/driver.form.service';
import DriverViewDetails from '@/app/dashboard/driver/DriverViewDetails';
import BaseForm from '@/components/BaseForm/BaseForm';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import QRGeneratDialog from '@/components/QRCode/QRGenerateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormControlGroup, FormField, FormItem } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ListFormValues, useGetListDrivers } from '@/hooks/useDrivers';
import { getUserStatusColor } from '@/lib/user-status';
import { cn, formatPhone } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { Download, Loader2, ScanQrCode, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';

// --- Local Page Definitions ---

const driverListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    status: z.number().nullable().optional(),
    top: z.number().default(15),
    page: z.number().default(1)
});

const driverListDefaultValues = {
    searchText: '',
    fromDate: '',
    toDate: '',
    top: 15,
    page: 1,
    status: null
};

const statusDropDownFilter = (t: TFunction) => [
    { label: t('drivers.list_page.all_status'), value: 'all' },
    { label: t('drivers.list_page.status_active'), value: '1' },
    { label: t('drivers.list_page.status_inactive'), value: '0' },
    { label: t('drivers.list_page.status_new'), value: '2' }
];

type QrDialogMode = 'ACTIVATE_DRIVER' | 'INSTALL_APP';

export function DriverList() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [qrMode, setQrMode] = useState<QrDialogMode | null>(null);

    // 1. Single Source of Truth from URL
    const currentParamsFromUrl: ListFormValues = useMemo(
        () => ({
            searchText:
                searchParams.get('searchText') ??
                driverListDefaultValues.searchText,
            fromDate:
                searchParams.get('fromDate') ??
                driverListDefaultValues.fromDate,
            toDate:
                searchParams.get('toDate') ?? driverListDefaultValues.toDate,
            top: Number(searchParams.get('top') ?? driverListDefaultValues.top),
            page: Number(
                searchParams.get('page') ?? driverListDefaultValues.page
            ),
            status:
                searchParams.get('status') !== null
                    ? Number(searchParams.get('status'))
                    : null
        }),
        [searchParams]
    );

    const [formData, setFormData] =
        useState<ListFormValues>(currentParamsFromUrl);
    const { data, isFetching, isFetchedAfterMount } =
        useGetListDrivers(formData);

    // 2. Centralized Change Handler (Reset to Page 1 on filter change)
    const handleFormChange = (newValues: ListFormValues) => {
        const isFilterChanged =
            newValues.searchText !== formData.searchText ||
            newValues.fromDate !== formData.fromDate ||
            newValues.toDate !== formData.toDate ||
            newValues.status !== formData.status;

        const updatedValues = {
            ...newValues,
            page: isFilterChanged ? 1 : newValues.page
        };

        setFormData(updatedValues);
    };

    // 3. Unified URL Syncing
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, String(value));
            }
        });

        const newQuery = params.toString();
        if (newQuery !== searchParams.toString()) {
            router.replace(`${pathname}?${newQuery}`, { scroll: false });
        }
    }, [formData, pathname, router, searchParams]);

    const columnDefs: ColumnDef<DriverResponseData>[] = useMemo(
        () => [
            {
                accessorKey: 'username',
                header: t('drivers.list_page.table.profile'),
                cell: ({ row }) => {
                    const { profileUrl, username } = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border shadow-sm">
                                <AvatarImage
                                    src={profileUrl ?? '/nodata/driver.svg'}
                                    alt={username}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-accent text-primary">
                                    {username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="font-medium text-sm w-[230px] truncate text-primary">
                                {username}
                            </h2>
                        </div>
                    );
                }
            },
            {
                accessorKey: 'zone',
                header: t('drivers.list_page.table.assigned_zone'),
                cell: ({ row }) => (
                    <div className="font-medium text-sm">
                        {row.original.zone?.name ||
                            t('drivers.list_page.table.unassigned')}
                    </div>
                )
            },
            {
                accessorKey: 'fleetType',
                header: t('drivers.list_page.table.assigned_fleet'),
                cell: ({ row }) => (
                    <div className="font-medium text-sm">
                        {row.getValue('fleetType')}
                    </div>
                )
            },
            {
                accessorKey: 'primaryPhone',
                header: t('drivers.list_page.table.primary_phone'),
                cell: ({ row }) => (
                    <div className="font-medium text-sm">
                        {formatPhone(row.getValue('primaryPhone') ?? '')}
                    </div>
                )
            },
            {
                accessorKey: 'status',
                header: t('drivers.list_page.table.status'),
                cell: ({ row }) => {
                    const status: number = row.getValue('status');
                    const statusObj = getUserStatusColor(status);
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    `h-2 w-2 rounded-full`,
                                    statusObj.bgClass
                                )}
                            />
                            <span>{statusObj.label}</span>
                        </div>
                    );
                }
            },
            {
                id: 'actions',
                header: t('drivers.list_page.table.actions'),
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <div className="flex gap-2">
                            {status === 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleQRClick(row.original);
                                    }}
                                >
                                    <ScanQrCode size={18} />
                                </Button>
                            )}
                            <Link
                                onClick={(e) => e.stopPropagation()}
                                href={`/dashboard/driver/edit/${row.original.id}`}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                                >
                                    <SquarePen size={18} />
                                </Button>
                            </Link>
                        </div>
                    );
                }
            }
        ],
        [t]
    );

    const onRowItemClicked = (item: DriverResponseData) => {
        setSelectedId(item.id);
        setOpen(true);
    };

    const handleQRClick = (item: DriverResponseData) => {
        setQrMode('ACTIVATE_DRIVER');
        setQrValue(item.dynamicActiveurl);
        setOpenQrDialog(true);
    };

    const handleInstallDriverApp = () => {
        setQrMode('INSTALL_APP');
        setQrValue(`${process.env.NEXT_PUBLIC_LMD_DOWNLOAD_DRIVER_APP}`);
        setOpenQrDialog(true);
    };

    return (
        <BaseForm
            schema={driverListSchema}
            defaultValues={currentParamsFromUrl}
            onChange={handleFormChange}
        >
            <div className="p-8 flex flex-col h-full">
                <ListPageTitleComponent
                    title={t('drivers.list_page.title')}
                    createHref="/dashboard/driver/create"
                    createLabel={t('drivers.list_page.create_btn')}
                    showCreateButton={true}
                    downloadButton={
                        <Button
                            type="button"
                            className="text-white cursor-pointer"
                            onClick={handleInstallDriverApp}
                        >
                            <Download
                                size={16}
                                strokeWidth={1}
                                className="text-white"
                            />
                            {t('drivers.list_page.download_driver_app')}
                        </Button>
                    }
                    filterItem={
                        <FormField
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControlGroup>
                                        <Select
                                            onValueChange={(val) =>
                                                field.onChange(
                                                    val === 'all'
                                                        ? null
                                                        : Number(val)
                                                )
                                            }
                                            value={
                                                field.value !== null
                                                    ? String(field.value)
                                                    : 'all'
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-700">
                                                        {t(
                                                            'drivers.list_page.status_filter'
                                                        )}
                                                    </span>
                                                    <Separator
                                                        orientation="vertical"
                                                        className="min-h-[20px]"
                                                    />
                                                    <SelectValue
                                                        placeholder={t(
                                                            'drivers.list_page.all_status'
                                                        )}
                                                    />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusDropDownFilter(t).map(
                                                    (item) => (
                                                        <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControlGroup>
                                </FormItem>
                            )}
                        />
                    }
                />

                <div className="py-2.5 flex-[1_1_auto]">
                    {isFetching && !isFetchedAfterMount && (
                        <div className="flex flex-col items-center justify-center p-12 gap-3 bg-white rounded-lg border">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-gray-500">
                                {t('drivers.list_page.empty_state.loading')}
                            </p>
                        </div>
                    )}
                    {(!isFetching || isFetchedAfterMount) && data && (
                        <>
                            <ListDataTableComponent
                                data={data?.value ?? []}
                                columns={columnDefs}
                                onRowItemClicked={onRowItemClicked}
                                filteredKeys={[
                                    'searchText',
                                    'fromDate',
                                    'toDate',
                                    'status'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image={'/nodata/driver.svg'}
                                    title_no_data={t(
                                        'drivers.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'drivers.list_page.empty_state.description'
                                    )}
                                    createHref="/dashboard/driver/create"
                                    createLabel={t(
                                        'drivers.list_page.create_btn'
                                    )}
                                />
                            </ListDataTableComponent>
                            <div className="border bg-white rounded-lg p-4 mt-2.5">
                                <ListPaginationComponent
                                    totalCount={data.totalCount}
                                />
                            </div>
                        </>
                    )}
                </div>

                <DriverViewDetails
                    open={open}
                    onOpenChange={setOpen}
                    driverId={selectedId}
                />

                <QRGeneratDialog
                    open={openQrDialog}
                    onOpenChange={(isOpen) => {
                        setOpenQrDialog(isOpen);
                        if (!isOpen) {
                            setQrValue(null);
                            setQrMode(null);
                        }
                    }}
                    qrType={
                        qrMode === 'INSTALL_APP'
                            ? t('drivers.list_page.qr_driver_app_scan')
                            : t('drivers.list_page.qr_activate_scan')
                    }
                    value={qrValue ?? ''}
                    title={
                        qrMode === 'INSTALL_APP'
                            ? t('drivers.list_page.qr_driver_app_title')
                            : t('common.qr_code.title')
                    }
                />
            </div>
        </BaseForm>
    );
}
