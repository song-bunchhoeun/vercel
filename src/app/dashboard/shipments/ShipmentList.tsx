'use client';

import {
    AddressStatus,
    TaskStatus,
    TaskType
} from '@/app/dashboard/shipments/(form)/shipment.form.service';
import ImportBulkButton from '@/app/dashboard/shipments/bulk/ImportBulkButton';
import ShipmentFailedReasonDialog from '@/app/dashboard/shipments/ShipmentReason';
import ShipmentViewDetails from '@/app/dashboard/shipments/ShipmentViewDetails';
import { WarehouseFilter } from '@/app/dashboard/shipments/WarehouseFilter';
import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import DownloadTemplateButton from '@/components/common/Buttons/DownloadTemplateButton';
import Toast from '@/components/common/toast/Toast';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
    getAvailableStatusOptions,
    getStatusMeta,
    shipmentStatusFilter,
    syncStatus
} from '@/data/filter';
import {
    ShipmentFilters,
    useDeleteShipments,
    useGetShipments,
    useUpdateShipmentStatus
} from '@/hooks/useShipments';
import { useGetUserProfile } from '@/hooks/useUsers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { getFormattedDate } from '@/lib/dayjs';
import { cn, formatPhone } from '@/lib/utils';
import { ParcelData } from '@/models/response.model';
import { WarehouseStatus } from '@/models/status';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
    Check,
    ChevronDown,
    CircleAlert,
    CircleCheck,
    FileText,
    SquarePen,
    Trash2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import z from 'zod';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

export const shipmentListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    top: z.number(),
    page: z.number(),
    status: z.array(z.number()),
    warehouseIds: z.array(z.string()).optional()
});

export function ShipmentList() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedId, setSelectedId] = useState<string>();
    const [reasonsDialogOpen, setReasonsDialogOpen] = useState(false);
    const [selectedForFailed, setSelectedForFailed] =
        useState<ParcelData | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const { mutate: updateStatus, isPending: isUpdatingStatus } =
        useUpdateShipmentStatus();

    const { data: profile } = useGetUserProfile();
    const defaultValues: ShipmentFilters = useMemo(() => {
        const warehouseIdParams = searchParams?.getAll('warehouseIds') ?? [];
        let finalWarehouseId = warehouseIdParams;
        if (profile && !profile.isAdmin && profile.warehouse?.id) {
            finalWarehouseId = [profile.warehouse.id];
        }

        return {
            searchText: searchParams?.get('searchText') ?? '',
            fromDate: searchParams?.get('fromDate') ?? '',
            toDate: searchParams?.get('toDate') ?? '',
            top: Number(searchParams?.get('top') ?? 15),
            page: Number(searchParams?.get('page') ?? 1),
            status: searchParams?.getAll('status').length
                ? searchParams?.getAll('status').map(Number)
                : [1, 8],
            warehouseIds: finalWarehouseId
        };
    }, [searchParams, profile]);

    const [formData, setFormData] = useState<ShipmentFilters>(defaultValues);

    const { data: warehouse } = useWarehouses({
        top: 9999,
        page: 1,
        status: String(WarehouseStatus.Active)
    });

    const activeWarehouseIds = useMemo(
        () => warehouse?.value.map((w) => w.id) || [],
        [warehouse?.value]
    );

    const noWarehouseData =
        !formData.warehouseIds || formData.warehouseIds.length === 0;

    const { data, isFetching, isFetchedAfterMount } = useGetShipments({
        ...formData,
        warehouseIds: noWarehouseData
            ? activeWarehouseIds
            : formData.warehouseIds
    });
    const shipments = useMemo(() => data?.value || [], [data?.value]);
    const { mutate: deleteShipments } = useDeleteShipments();

    // Reset failure state when the data actually updates to "Failed"
    useEffect(() => {
        if (selectedForFailed) {
            const current = shipments.find(
                (s) => s.id === selectedForFailed.id
            );
            if (current?.status === TaskStatus.Failed) {
                setSelectedForFailed(null);
            }
        }
    }, [shipments, selectedForFailed]);

    useEffect(() => {
        const params = new URLSearchParams();
        formData.status?.forEach((s) => params.append('status', String(s)));
        if (formData.searchText) params.set('searchText', formData.searchText);
        if (formData.fromDate) params.set('fromDate', formData.fromDate);
        if (formData.toDate) params.set('toDate', formData.toDate);

        if (formData.warehouseIds && formData.warehouseIds.length > 0) {
            formData.warehouseIds.forEach((w) =>
                params.append('warehouseIds', w)
            );
        }

        params.set('top', String(formData.top));
        params.set('page', String(formData.page));

        window.history.replaceState(
            null,
            '',
            `${pathname}?${params.toString()}`
        );
    }, [pathname, formData]);

    const handleDelete = (ids: string[]) => {
        setDialogContent({
            icon: (
                <span className="bg-danger p-3 rounded-full">
                    <Trash2 className="text-danger w-6 h-6" />
                </span>
            ),
            title: t('shipments.list_page.delete_dialog.title'),
            description: t('shipments.list_page.delete_dialog.description'),
            actions: (
                <div className="w-full flex justify-center gap-4">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            deleteShipments(ids, {
                                onSuccess: () => {
                                    setRowSelection({});
                                    setDialogContent({
                                        icon: (
                                            <span className="bg-success-50 p-3 rounded-full">
                                                <CircleCheck className="text-success-500 w-6 h-6" />
                                            </span>
                                        ),
                                        title: t(
                                            'shipments.list_page.delete_dialog.success_title'
                                        ),
                                        description: t(
                                            'shipments.list_page.delete_dialog.success_desc',
                                            { count: ids.length }
                                        )
                                    });
                                    setTimeout(
                                        () => setOpenConfirm(false),
                                        2000
                                    );
                                    setOpenDetail(false);
                                },
                                onError: (error: unknown) => {
                                    const message =
                                        error instanceof Error
                                            ? error.message
                                            : t('users.form.edit_error');

                                    // Attempt to extract deep backend message if available
                                    const backendMessage =
                                        (
                                            error as {
                                                response?: {
                                                    data?: { message?: string };
                                                };
                                            }
                                        )?.response?.data?.message ?? message;

                                    toast.custom((toastId) => (
                                        <Toast
                                            toastId={toastId}
                                            status="failed"
                                            description={backendMessage}
                                        />
                                    ));
                                }
                            });
                        }}
                    >
                        {t('shipments.list_page.delete_dialog.confirm')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setOpenConfirm(false)}
                    >
                        {t('shipments.list_page.delete_dialog.cancel')}
                    </Button>
                </div>
            )
        });
        setOpenConfirm(true);
    };

    const columnDefs = useMemo<ColumnDef<ParcelData>[]>(() => {
        const columns: ColumnDef<ParcelData>[] = [];

        if (
            formData.status?.includes(TaskStatus.New) ||
            formData.status?.includes(TaskStatus.Assigned)
        ) {
            columns.push({
                id: 'select',
                header: ({ table }) => (
                    <div
                        className="flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(v) =>
                                table.toggleAllPageRowsSelected(!!v)
                            }
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-none"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div
                        className="flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(v) => row.toggleSelected(!!v)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-none"
                        />
                    </div>
                )
            });
        }

        columns.push(
            {
                id: 'customerName',
                header: t('shipments.list_page.table.customer_name'),
                accessorFn: (row) => row.customer.name,
                cell: ({ row }) => (
                    <div className="w-32.5">
                        <p className="font-medium truncate">
                            {row.original.customer.name}
                        </p>
                    </div>
                )
            },
            {
                id: 'phoneNumber',
                header: t('shipments.list_page.table.phone_number'),
                accessorFn: (row) => row.customer.primaryPhone,
                cell: ({ row }) => (
                    <div className="font-medium">
                        {formatPhone(row.original.customer.primaryPhone ?? '')}
                    </div>
                )
            },
            {
                id: 'deliveryAddress',
                header: t('shipments.list_page.table.delivery_address'),
                cell: ({ row }) => {
                    const { address } = row.original;
                    const isInvalidAddress =
                        address.status === AddressStatus.NotFound ||
                        address.status === AddressStatus.Invalid;

                    return (
                        <div className="flex flex-col justify-center py-1 leading-tight min-h-10 w-100">
                            <span className="font-medium">
                                {row.original.address.label}
                            </span>
                            {isInvalidAddress && (
                                <div className="flex items-center gap-1.5 text-destructive font-medium">
                                    <CircleAlert className="w-4 h-4" />
                                    <span>
                                        {t(
                                            'shipments.view_details.info.address_not_found'
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="truncate text-sm">
                                {row.original.address.line}
                            </div>
                        </div>
                    );
                }
            },
            {
                id: 'parcelQTY',
                header: t('shipments.list_page.table.parcel_qty'),
                accessorFn: (row) => row.item.qty,
                cell: ({ row }) => (
                    <div className="font-medium">
                        {row.original.item.qty ?? 0}
                    </div>
                )
            },
            {
                accessorKey: 'date',
                header: t('shipments.list_page.table.created_date'),
                cell: ({ row }) => {
                    const d = new Date(row.original.date || '');
                    return (
                        <div className="font-medium">{getFormattedDate(d)}</div>
                    );
                }
            },
            {
                id: 'warehouse',
                header: 'Warehouse Name',
                accessorFn: (row) => row.warehouse.name,
                cell: ({ row }) => (
                    <div className="w-32.5">
                        <p className="font-medium truncate">
                            {row.original?.warehouse?.name}
                        </p>
                    </div>
                )
            },
            {
                accessorKey: 'taskType',
                header: t('shipments.list_page.table.task_type'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.taskType === 1
                            ? t('shipments.list_page.table.drop_off')
                            : t('shipments.list_page.table.pick_up')}
                    </div>
                )
            },
            {
                accessorKey: 'status',
                header: t('shipments.list_page.table.task_status'),
                cell: ({ row }) => (
                    <TaskStatusCell
                        shipment={row.original}
                        formStatus={formData.status!}
                        onOpenFailedReason={(s) => {
                            setSelectedForFailed(s);
                            setReasonsDialogOpen(true);
                        }}
                        isFailing={
                            selectedForFailed?.id === row.original.id &&
                            row.original.status !== TaskStatus.Failed
                        }
                    />
                )
            },
            {
                accessorKey: 'syncStatus',
                header: t('shipments.list_page.table.sync_status'),
                cell: ({ row }) => {
                    const meta = syncStatus[row.original.syncStatus];

                    if (!meta) return <span>-</span>;

                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${meta.color}`}
                            />
                            <span>{t(meta.translateKey)}</span>
                        </div>
                    );
                }
            },
            {
                id: 'actions',
                header: () => {
                    const showAction = [1, 4, 5].some((s) =>
                        formData.status?.includes(s)
                    );
                    return (
                        showAction && (
                            <span>{t('shipments.list_page.table.action')}</span>
                        )
                    );
                },
                cell: ({ row }) => (
                    <div className="flex gap-1.5">
                        {formData.status?.includes(1) && (
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                            >
                                <Link
                                    href={`/dashboard/shipments/edit/${row.original.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SquarePen className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        {(formData.status?.includes(4) ||
                            formData.status?.includes(5)) && (
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                            >
                                <Link
                                    href={`/dashboard/shipments/view/${row.original.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FileText className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                )
            }
        );
        return columns;
    }, [formData.status, selectedForFailed, t]);

    return (
        <BaseForm
            schema={shipmentListSchema}
            defaultValues={defaultValues}
            onChange={setFormData}
        >
            <div className="p-8 flex flex-col h-full">
                <ListPageTitleComponent
                    title={t('shipments.list_page.title')}
                    subtitle=""
                    createHref="/dashboard/shipments/create"
                    createLabel={t('shipments.list_page.create_btn')}
                    showCreateButton={data && data.totalCount >= 0}
                    filterItem={
                        <FormField
                            name="status"
                            render={({ field }) => (
                                <div className="w-full">
                                    <ButtonGroup className="flex gap-6">
                                        {shipmentStatusFilter.map((item) => {
                                            // Compare arrays to determine if this filter is active
                                            const isActive =
                                                field.value?.length ===
                                                    item.value.length &&
                                                item.value.every((v) =>
                                                    field.value.includes(v)
                                                );

                                            return (
                                                <Button
                                                    key={item.label}
                                                    type="button"
                                                    variant="ghost"
                                                    className={cn(
                                                        'cursor-pointer h-auto px-0 py-3 rounded-none bg-transparent hover:bg-transparent transition-all shadow-none',
                                                        'text-sm font-medium',
                                                        isActive
                                                            ? 'text-primary border-b-[3px] border-primary'
                                                            : 'text-muted-foreground hover:text-primary border-b-[3px] border-transparent'
                                                    )}
                                                    onClick={() =>
                                                        field.onChange(
                                                            item.value
                                                        )
                                                    }
                                                >
                                                    {t(item.translateKey!)}
                                                </Button>
                                            );
                                        })}
                                    </ButtonGroup>
                                </div>
                            )}
                        />
                    }
                    filterKey={<WarehouseFilter profile={profile} />}
                    actionButton={
                        <div className="flex gap-2.5 items-center">
                            <DownloadTemplateButton />
                            <ImportBulkButton
                                onImportSuccess={(parsed) => {
                                    sessionStorage.setItem(
                                        'bulkImportData',
                                        JSON.stringify(parsed)
                                    );
                                    router.push('/dashboard/shipments/bulk');
                                }}
                            />
                        </div>
                    }
                    selectedDelete={
                        formData.status?.includes(1) &&
                        Object.keys(rowSelection).length > 0 && (
                            <div className="flex items-center">
                                <Separator
                                    orientation="vertical"
                                    className="mr-4 min-h-6"
                                />
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        const ids = Object.keys(rowSelection)
                                            .map(
                                                (k) => shipments[Number(k)]?.id
                                            )
                                            .filter(Boolean);
                                        handleDelete(ids);
                                    }}
                                >
                                    <Trash2 className="text-error-600" />
                                    {/* Updated to use your new error palette */}
                                </Button>
                            </div>
                        )
                    }
                />

                <div className="py-2.5 flex-[1_1_auto]">
                    {isFetching && !isFetchedAfterMount ? (
                        <div className="p-6 text-center">
                            {t('shipments.list_page.empty_state.loading')}
                        </div>
                    ) : (
                        <>
                            <ListDataTableComponent
                                data={shipments}
                                columns={columnDefs}
                                rowSelection={rowSelection}
                                onRowSelectionChange={setRowSelection}
                                onRowItemClicked={(item) => {
                                    setSelectedId(item.id);
                                    setOpenDetail(true);
                                }}
                                filteredKeys={[
                                    'status',
                                    'warehouseIds',
                                    'searchText',
                                    'fromDate',
                                    'toDate'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image={'/nodata/shipment.svg'}
                                    title_no_data={t(
                                        'shipments.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'shipments.list_page.empty_state.description'
                                    )}
                                    createHref="/dashboard/shipments/create"
                                    createLabel={t(
                                        'shipments.list_page.create_btn'
                                    )}
                                />
                            </ListDataTableComponent>
                            <div className="border bg-white rounded-lg p-4 mt-2.5">
                                <ListPaginationComponent
                                    totalCount={data?.totalCount || 0}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={setOpenConfirm}
                dialogContent={dialogContent!}
            />

            <ShipmentFailedReasonDialog
                open={reasonsDialogOpen}
                onOpenChange={(v) => {
                    setReasonsDialogOpen(v);
                    if (!v && !isUpdatingStatus) setSelectedForFailed(null);
                }}
                onSubmit={(reason) => {
                    if (selectedForFailed) {
                        updateStatus(
                            {
                                id: selectedForFailed.id,
                                status: TaskStatus.Failed,
                                note: reason
                            },
                            {
                                onSuccess: () => {
                                    toast.custom((toastId) => (
                                        <Toast
                                            toastId={toastId}
                                            status="success"
                                            description={t(
                                                'common.status.update_success'
                                            )}
                                        />
                                    ));
                                },
                                onError: () => setSelectedForFailed(null)
                            }
                        );
                    }
                    setReasonsDialogOpen(false);
                }}
            />

            {selectedId && (
                <ShipmentViewDetails
                    open={openDetail}
                    onOpenChange={setOpenDetail}
                    selectedId={selectedId}
                    onDelete={(id) => handleDelete([id])}
                />
            )}
        </BaseForm>
    );
}

// --- Sub-component for Status Cell (To support useUpdateShipmentStatus(id)) ---
function TaskStatusCell({
    shipment,
    formStatus,
    onOpenFailedReason,
    isFailing
}: {
    shipment: ParcelData;
    formStatus: number[];
    onOpenFailedReason: (s: ParcelData) => void;
    isFailing: boolean;
}) {
    const { t } = useTranslation();
    const currentStatus = shipment.status as TaskStatus;
    const taskType = shipment.taskType as TaskType;
    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const { mutate: updateStatus, isPending } = useUpdateShipmentStatus();

    const displayStatus = isFailing
        ? TaskStatus.Failed
        : open || isPending
          ? selectedStatus
          : currentStatus;
    const meta = getStatusMeta(displayStatus);
    const statusOptions = getAvailableStatusOptions(taskType, currentStatus);
    const isInteractive =
        !isPending &&
        !isFailing &&
        (formStatus.includes(2) || formStatus.includes(3)) &&
        statusOptions.length > 0;

    useEffect(() => {
        if (!open && !isPending && !isFailing) setSelectedStatus(currentStatus);
    }, [currentStatus, open, isPending, isFailing]);

    if (!isInteractive) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2',
                    (isPending || isFailing) && 'opacity-50'
                )}
            >
                <div className={`h-2 w-2 rounded-full ${meta.color}`} />
                <span>{t(meta.translateKey!)}</span>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="z-50 cursor-pointer">
                <button
                    className={cn(
                        'flex items-center gap-2',
                        isPending && 'opacity-50'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`h-2 w-2 rounded-full ${meta.color}`} />
                    <span>{t(meta.translateKey!)}</span>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-44 px-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-3">
                    <span className="px-3 text-sm font-semibold">
                        {t('shipments.list_page.status_cell.all_status')}
                    </span>
                    <Separator />
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className="text-left px-3 py-1 rounded hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                            onClick={() =>
                                setSelectedStatus(opt.value as TaskStatus)
                            }
                        >
                            <div className="flex gap-2 items-center">
                                <div
                                    className={`h-2 w-2 rounded-full ${opt.color}`}
                                />
                                <span>{t(opt.translateKey!)}</span>
                            </div>
                            {selectedStatus === opt.value && (
                                <Check className="h-4 w-4" />
                            )}
                        </button>
                    ))}
                    <Separator />
                    <div className="flex justify-between gap-2 px-3 pb-1">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 h-9 px-0"
                        >
                            {t('shipments.list_page.status_cell.cancel')}
                        </Button>
                        <Button
                            className="flex-1 h-9 px-0 cursor-pointer"
                            onClick={() => {
                                if (selectedStatus === TaskStatus.Failed) {
                                    onOpenFailedReason(shipment);
                                    setOpen(false);
                                } else {
                                    updateStatus(
                                        {
                                            id: shipment.id,
                                            status: selectedStatus
                                        },
                                        {
                                            onSuccess: () => setOpen(false)
                                        }
                                    );
                                }
                            }}
                        >
                            {t('shipments.list_page.status_cell.save')}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
