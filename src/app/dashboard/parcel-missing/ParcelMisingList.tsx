'use client';

import {
    MissingStatus,
    ParcelMissingListParams,
    parcelMissingListSchema
} from '@/app/dashboard/parcel-missing/parcel.missing.form.service';
import ShipmentViewDetails from '@/app/dashboard/shipments/ShipmentViewDetails';
import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import Toast from '@/components/common/toast/Toast';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PARCEL_STATUS } from '@/data/filter';
import {
    useGetParcelMissings,
    useUpdateParcelStatus
} from '@/hooks/useParcelMissings';
import { getFormattedDate } from '@/lib/dayjs';
import { formatPhone } from '@/lib/utils';
import { ParcelData } from '@/models/response.model';
import { ColumnDef } from '@tanstack/react-table';
import { CircleCheck, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

export function ParcelMissingList() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [confirmData, setConfirmData] = useState<{
        parcelId: string;
        status: MissingStatus;
    } | null>(null);
    const [openConfirm, setOpenConfirm] = useState(false);

    const [selectedParcelId, setSelectedParcelId] = useState<string>();
    const [openDetails, setOpenDetails] = useState(false);

    const {
        mutate: updateStatus,
        isPending,
        isSuccess,
        reset: resetMutation
    } = useUpdateParcelStatus();

    const currentParamsFromUrl: ParcelMissingListParams = useMemo(
        () => ({
            searchText: searchParams?.get('searchText') || '',
            fromDate: searchParams?.get('fromDate') || '',
            toDate: searchParams?.get('toDate') || '',
            top: Number(searchParams?.get('top') || 15),
            page: Number(searchParams?.get('page') || 1)
        }),
        [searchParams]
    );

    const { data, isFetching, isFetchedAfterMount } =
        useGetParcelMissings(currentParamsFromUrl);

    const handleFormChange = (newValues: ParcelMissingListParams) => {
        const params = new URLSearchParams();
        Object.entries(newValues).forEach(([key, value]) => {
            if (value) params.set(key, String(value));
        });

        // Reset to page 1 if filters changed
        const hasFilterChanged =
            newValues.searchText !== currentParamsFromUrl.searchText ||
            newValues.fromDate !== currentParamsFromUrl.fromDate ||
            newValues.toDate !== currentParamsFromUrl.toDate;

        if (hasFilterChanged) params.set('page', '1');

        if (params.toString() !== searchParams?.toString()) {
            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false
            });
        }
    };

    const openConfirmDialog = useCallback(
        (parcelId: string, status: number) => {
            setConfirmData({ parcelId, status: status as MissingStatus });
            resetMutation();
            setOpenConfirm(true);
        },
        [resetMutation]
    );

    const columnDefs: ColumnDef<ParcelData>[] = useMemo(
        () => [
            {
                id: 'customerName',
                header: t('parcel_missing.list_page.table.customer_name'),
                accessorFn: (row) => row.customer.name,
                cell: ({ row }) => (
                    <div className="font-medium w-30 py-2">
                        {row.original.customer.name}
                    </div>
                )
            },
            {
                id: 'phoneNumber',
                header: t('parcel_missing.list_page.table.phone'),
                accessorFn: (row) => row.customer.primaryPhone,
                cell: ({ row }) => (
                    <div className="font-medium">
                        {formatPhone(row.original.customer.primaryPhone ?? '')}
                    </div>
                )
            },
            {
                id: 'deliveryAddress',
                header: t('parcel_missing.list_page.table.address'),
                cell: ({ row }) => (
                    <div className="flex flex-col justify-center py-1 leading-tight min-h-10 w-100">
                        <span className="font-medium">
                            {row.original.address.label}
                        </span>
                        <div className="truncate text-sm">
                            {row.original.address.line}
                        </div>
                    </div>
                )
            },
            {
                accessorKey: 'taskType',
                header: t('parcel_missing.list_page.table.task_type'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.taskType === 1
                            ? t('shipments.list_page.table.drop_off')
                            : t('shipments.list_page.table.pick_up')}
                    </div>
                )
            },
            {
                id: 'parcelQTY',
                header: t('parcel_missing.list_page.table.parcel_qty'),
                accessorFn: (row) => row.item.qty,
                cell: ({ row }) => (
                    <div className="font-medium">
                        {row.original.item.qty ?? 0}
                    </div>
                )
            },
            {
                accessorKey: 'date',
                header: t('parcel_missing.list_page.table.created_date'),
                cell: ({ row }) => {
                    const d = new Date(row.original.date || '');
                    return (
                        <div className="font-medium">{getFormattedDate(d)}</div>
                    );
                }
            },
            {
                accessorKey: 'taskStatus',
                header: t('parcel_missing.list_page.table.task_status'),
                cell: ({ row }) => {
                    const statusValue = row.original.status;
                    const statusConfig = PARCEL_STATUS.find(
                        (s) => s.value === statusValue
                    );

                    return (
                        <div className="flex items-center gap-2 w-30 py-2">
                            <span
                                className={`h-2 w-2 rounded-full ${statusConfig?.color}`}
                            />

                            <span className="font-medium text-sm">
                                {t(
                                    statusConfig?.translateKey ||
                                        'common.status.unknown'
                                )}
                            </span>
                        </div>
                    );
                }
            },
            {
                accessorKey: 'missingStatusAction',
                header: t('shipments.list_page.table.action'),
                cell: ({ row }) => {
                    const parcelId = row.original.id;
                    const value =
                        row.original.missingStatus === MissingStatus.Missing
                            ? String(MissingStatus.Missing)
                            : row.original.missingStatus === MissingStatus.Found
                              ? String(MissingStatus.Found)
                              : undefined;

                    return (
                        <div onClick={(e) => e.stopPropagation()}>
                            <RadioGroup
                                disabled={isPending}
                                value={value}
                                onValueChange={(v) =>
                                    openConfirmDialog(parcelId, Number(v))
                                }
                                className="flex gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value={String(MissingStatus.Missing)}
                                    />
                                    <span>
                                        {t(
                                            'parcel_missing.list_page.table.status_missing'
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value={String(MissingStatus.Found)}
                                    />
                                    <span>
                                        {t(
                                            'parcel_missing.list_page.table.status_found'
                                        )}
                                    </span>
                                </div>
                            </RadioGroup>
                        </div>
                    );
                }
            }
        ],
        [isPending, openConfirmDialog, t]
    );

    const dialogContent: BaseDialogContentProps | null = useMemo(() => {
        if (!confirmData) return null;

        const statusLabel =
            confirmData.status === MissingStatus.Found
                ? t('parcel_missing.list_page.table.status_found')
                : t('parcel_missing.list_page.table.status_missing');

        const statusKey =
            confirmData.status === MissingStatus.Found ? 'found' : 'not_found';

        if (isSuccess) {
            return {
                icon: (
                    <span className="bg-success-50 p-3 rounded-full">
                        <CircleCheck className="w-6 h-6 text-success-500" />
                    </span>
                ),
                title: t(
                    `parcel_missing.list_page.dialog.success_title_${statusKey}`
                ),
                description: t(
                    'parcel_missing.list_page.dialog.success_description',
                    {
                        status: statusLabel
                    }
                )
            };
        }

        return {
            icon: (
                <span className="bg-blue-50 p-3 rounded-full">
                    <Info className="w-6 h-6 text-primary" />
                </span>
            ),
            title: t(
                `parcel_missing.list_page.dialog.confirm_title_${statusKey}`
            ),
            description: t(
                `parcel_missing.list_page.dialog.confirm_description_${statusKey}`
            ),
            actions: (
                <div className="w-full flex justify-center gap-4">
                    <Button
                        variant="warning"
                        onClick={() => setOpenConfirm(false)}
                        disabled={isPending}
                        className="cursor-pointer"
                    >
                        {t('parcel_missing.list_page.dialog.cancel')}
                    </Button>
                    <Button
                        disabled={isPending}
                        onClick={() => {
                            updateStatus(
                                {
                                    id: confirmData.parcelId,
                                    missingStatus: confirmData.status
                                },
                                {
                                    onError: () => {
                                        toast.custom((id) => (
                                            <Toast
                                                toastId={id}
                                                status="failed"
                                                description={t(
                                                    'common.status.update_failed'
                                                )}
                                            />
                                        ));
                                        setOpenConfirm(false);
                                    }
                                }
                            );
                        }}
                        className="cursor-pointer"
                    >
                        {isPending
                            ? t('parcel_missing.list_page.dialog.updating')
                            : t('parcel_missing.list_page.dialog.submit')}
                    </Button>
                </div>
            )
        };
    }, [confirmData, isSuccess, isPending, updateStatus, t]);

    return (
        <BaseForm
            schema={parcelMissingListSchema}
            defaultValues={currentParamsFromUrl}
            onChange={handleFormChange}
        >
            <div className="p-8 flex flex-col h-full">
                <ListPageTitleComponent
                    title={t('parcel_missing.list_page.title')}
                    showCreateButton={false}
                />

                <div className="py-2.5 flex-[1_1_auto]">
                    {isFetching && !isFetchedAfterMount && (
                        <div className="p-6 text-center text-muted-foreground">
                            {t('parcel_missing.list_page.empty_state.loading')}
                        </div>
                    )}

                    {(!isFetching || isFetchedAfterMount) && data && (
                        <>
                            <ListDataTableComponent
                                data={data.value}
                                columns={columnDefs}
                                onRowItemClicked={(item) => {
                                    setSelectedParcelId(item.id);
                                    setOpenDetails(true);
                                }}
                                filteredKeys={[
                                    'searchText',
                                    'fromDate',
                                    'toDate'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image="/nodata/parcel.svg"
                                    title_no_data={t(
                                        'parcel_missing.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'parcel_missing.list_page.empty_state.description'
                                    )}
                                    createHref="/"
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
            </div>

            {selectedParcelId && (
                <ShipmentViewDetails
                    open={openDetails}
                    onOpenChange={setOpenDetails}
                    selectedId={selectedParcelId}
                />
            )}

            {dialogContent && (
                <BaseDialogConfirmation
                    open={openConfirm}
                    onOpenChange={setOpenConfirm}
                    dialogContent={dialogContent}
                />
            )}
        </BaseForm>
    );
}
