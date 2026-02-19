'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams
} from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import { Separator } from '@/components/ui/separator';
import { PARCEL_STATUS } from '@/data/filter';
import { cn, formatPhone } from '@/lib/utils';

// Hooks & Services
import {
    useGetCustomerDetail,
    useGetShipmentHistory
} from '@/hooks/useCustomers';

// Dialogs
import { shipmentListSchema } from '@/app/dashboard/shipments/ShipmentList';
import ShipmentViewDetails from '@/app/dashboard/shipments/ShipmentViewDetails';
import BaseForm from '@/components/BaseForm/BaseForm';
import { ShipmentFilters } from '@/hooks/useShipments';
import { getFormattedDate } from '@/lib/dayjs';
import { ParcelData } from '@/models/response.model';
import { useTranslation } from 'react-i18next';

const ShipmentHistoryTab = ({ customerId }: { customerId: string }) => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedShipmentId, setSelectedShipmentId] = useState<string>();

    const queryParams = useMemo(() => {
        const statusFromUrl = searchParams
            .getAll('status')
            .map(Number)
            .filter(Boolean)
            .sort((a, b) => a - b); // sort to avoid order flip

        return {
            customerId,
            top: Number(searchParams.get('top') ?? 15),
            page: Number(searchParams.get('page') ?? 1),
            status: statusFromUrl.length ? statusFromUrl : [4, 5, 6]
        };
    }, [searchParams, customerId]);

    const isSameNumberArray = (a: number[], b: number[]) =>
        a.length === b.length && a.every((v, i) => v === b[i]);

    const handleFormChange = (newValues: ShipmentFilters) => {
        const nextStatus = [...(newValues.status ?? [])].sort((a, b) => a - b);

        const isFilterChanged =
            newValues.top !== queryParams.top ||
            !isSameNumberArray(nextStatus, queryParams.status);

        const params = new URLSearchParams();

        params.set('top', String(newValues.top));

        nextStatus.forEach((s) => params.append('status', String(s)));

        params.set('page', isFilterChanged ? '1' : String(queryParams.page));

        const newQuery = params.toString();
        if (newQuery !== searchParams.toString()) {
            router.replace(`${pathname}?${newQuery}`, { scroll: false });
        }
    };

    const { data } = useGetShipmentHistory(queryParams);

    const columns = useMemo<ColumnDef<ParcelData>[]>(
        () => [
            {
                accessorKey: 'id',
                header: t('customers.view_details.history.table.shipment_id'),
                cell: ({ row }) => (
                    <div className="font-medium text-foreground py-2 truncate w-32">
                        {row.original.id}
                    </div>
                )
            },
            {
                id: 'phoneNumber',
                header: t('customers.view_details.history.table.phone'),
                accessorFn: (row) => row.customer?.primaryPhone,
                cell: ({ row }) => (
                    <div className="font-medium">
                        {formatPhone(row.original.customer?.primaryPhone)}
                    </div>
                )
            },
            {
                id: 'deliveryAddress',
                header: t('customers.view_details.history.table.address'),
                cell: ({ row }) => (
                    <div className="w-60 py-1">
                        <span className="font-bold text-xs text-foreground block">
                            {row.original.address?.label || '-'}
                        </span>
                        <p className="truncate text-sm text-gray-600">
                            {row.original.address?.line || '-'}
                        </p>
                    </div>
                )
            },
            {
                header: t('customers.view_details.history.table.parcel_qty'),
                accessorFn: (row) => row.item?.qty,
                cell: ({ row }) => (
                    <div className="font-medium text-center">
                        {row.original.item?.qty ?? 0}
                    </div>
                )
            },
            {
                accessorKey: 'date',
                header: t('customers.view_details.history.table.created_date'),
                cell: ({ row }) => (
                    <div className="text-sm">
                        {getFormattedDate(row.original.date!)}
                    </div>
                )
            },
            {
                accessorKey: 'taskType',
                header: t('customers.view_details.history.table.task_type'),
                cell: ({ row }) => (
                    <div className="text-sm font-medium">
                        {row.original.taskType === 1 ? 'Drop-Off' : 'Pick-Up'}
                    </div>
                )
            },
            {
                accessorKey: 'status',
                header: t('customers.view_details.history.table.task_status'),
                cell: ({ row }) => {
                    const status = row.original.status;
                    const type = row.original.taskType;
                    const config = PARCEL_STATUS.find(
                        (s) => s.value === status
                    );

                    let label = config?.display ?? 'Unknown';
                    if (status === 4 || status === 5) {
                        label = type === 1 ? 'Delivered' : 'Picked up';
                    }

                    return (
                        <div className="flex items-center gap-2 font-medium">
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    config?.color ?? 'bg-gray-300'
                                )}
                            />
                            <span className="text-sm">{label}</span>
                        </div>
                    );
                }
            }
        ],
        [t]
    );

    return (
        <BaseForm
            defaultValues={queryParams}
            schema={shipmentListSchema}
            onChange={handleFormChange}
        >
            <div className="space-y-4">
                <ListDataTableComponent
                    data={data?.value || []}
                    columns={columns}
                    onRowItemClicked={(item) => {
                        setSelectedShipmentId(item.id);
                        setOpenDetails(true);
                    }}
                >
                    <div className="flex justify-center py-10 text-muted-foreground italic">
                        {t('customers.view_details.history.no_records')}
                    </div>
                </ListDataTableComponent>

                {data && data.totalCount > 0 && (
                    <div className="bg-white rounded-xl border p-4 shadow-sm">
                        <ListPaginationComponent totalCount={data.totalCount} />
                    </div>
                )}

                {selectedShipmentId && (
                    <ShipmentViewDetails
                        open={openDetails}
                        onOpenChange={setOpenDetails}
                        selectedId={selectedShipmentId}
                    />
                )}
            </div>
        </BaseForm>
    );
};

// --- Main Page Component ---

export default function CustomerDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const customerId = String(id);
    const [activeTab, setActiveTab] = useState<'customer' | 'shipment'>(
        'customer'
    );

    const { data: customer, isLoading } = useGetCustomerDetail(customerId);

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
        );
    }

    if (!customer) return null;

    return (
        <BaseFormLayout>
            {/* Header Section */}
            <div className="bg-white p-4 mb-3 rounded-md border border-neutral-100 shadow-sm">
                <h3 className="text-xl font-bold">
                    {t('customers.view_details.title')}
                </h3>

                <div className="flex gap-4 mt-4 font-medium text-sm">
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={cn(
                            'pb-1 cursor-pointer transition-all border-b-2',
                            activeTab === 'customer'
                                ? 'text-primary border-primary'
                                : 'text-foreground border-transparent hover:text-primary'
                        )}
                    >
                        {t('customers.view_details.tabs.info')}
                    </button>
                    <button
                        onClick={() => setActiveTab('shipment')}
                        className={cn(
                            'pb-1 cursor-pointer transition-all border-b-2',
                            activeTab === 'shipment'
                                ? 'text-primary border-primary'
                                : 'text-foreground border-transparent hover:text-primary'
                        )}
                    >
                        {t('customers.view_details.tabs.history')}
                    </button>
                </div>
            </div>

            {/* Content Panel */}
            <div className="min-h-100">
                {activeTab === 'customer' ? (
                    <div className="bg-white rounded-md p-4 border border-neutral-100 shadow-sm">
                        <h3 className="text-base font-semibold mb-4">
                            {t('customers.view_details.info.title')}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-secondary-foreground text-xs sm:text-sm mb-1 tracking-tight">
                                    {t('customers.view_details.info.name')}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {customer.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs sm:text-sm mb-1 tracking-tight">
                                    {t('customers.view_details.info.id')}
                                </p>
                                <p className="text-sm font-medium text-foreground break-all">
                                    {customer.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs sm:text-sm mb-1 tracking-tight">
                                    {t(
                                        'customers.view_details.info.created_date'
                                    )}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {getFormattedDate(customer.dateCreate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs sm:text-sm mb-1 tracking-tight">
                                    {t(
                                        'customers.view_details.info.primary_phone'
                                    )}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {formatPhone(customer.primaryPhone)}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs sm:text-sm mb-1 tracking-tight">
                                    {t(
                                        'customers.view_details.info.secondary_phone'
                                    )}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {formatPhone(customer.secondaryPhone)}
                                </p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {customer.addresses &&
                            customer.addresses.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold">
                                        {t(
                                            'customers.view_details.info.delivery_info'
                                        )}
                                    </h3>

                                    <div className="space-y-4">
                                        {customer.addresses.map(
                                            (info, index) => (
                                                <div key={info.id || index}>
                                                    <p className="text-sm font-medium text-foreground mb-1">
                                                        {info.label ||
                                                            t(
                                                                'customers.view_details.info.no_label'
                                                            )}
                                                        {index === 0 && (
                                                            <>
                                                                {' - '}
                                                                <span className="text-primary text-sm">
                                                                    {t(
                                                                        'customers.view_details.info.default_label'
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p className="text-secondary-foreground text-xs">
                                                        {info.line}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                ) : (
                    <div>
                        <Suspense
                            fallback={
                                <div className="p-10 text-center">
                                    <Loader2 className="animate-spin inline mr-2" />{' '}
                                    {t(
                                        'customers.view_details.history.loading'
                                    )}
                                </div>
                            }
                        >
                            <ShipmentHistoryTab customerId={customerId} />
                        </Suspense>
                    </div>
                )}
            </div>
        </BaseFormLayout>
    );
}
