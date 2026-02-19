'use client';

import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import { Button } from '@/components/ui/button';
import { ListFormValues, useWarehouses } from '@/hooks/useWarehouses';
import { ColumnDef } from '@tanstack/react-table';
import { SquarePen } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import z from 'zod';
import { Warehouse } from './(form)/warehouse.form.service';
import { cn, formatPhone } from '@/lib/utils';
import { getWHStatusColor } from '@/lib/warehouse-status';
import { getFormattedDate } from '@/lib/dayjs';
import { useTranslation } from 'react-i18next';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

const WarehouseViewDetails = dynamic(() => import('./WarehouseViewDetails'), {
    ssr: false
});

// move outside to prevent reinitialize
const warehouseListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    top: z.number().default(15),
    page: z.number().default(1)
});

export function WarehouseList() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const currentParamsFromUrl: ListFormValues = useMemo(
        () => ({
            searchText: searchParams.get('searchText') ?? '',
            fromDate: searchParams.get('fromDate') ?? '',
            toDate: searchParams.get('toDate') ?? '',
            top: Number(searchParams.get('top') ?? 15),
            page: Number(searchParams.get('page') ?? 1)
        }),
        [searchParams]
    );

    const { data, isFetching, isFetchedAfterMount } =
        useWarehouses(currentParamsFromUrl);

    const handleFormChange = (newValues: ListFormValues) => {
        // Compare values to see if we should reset pagination
        const isFilterChanged =
            newValues.searchText !== currentParamsFromUrl.searchText ||
            newValues.fromDate !== currentParamsFromUrl.fromDate ||
            newValues.toDate !== currentParamsFromUrl.toDate ||
            newValues.top !== currentParamsFromUrl.top; // Catch rows-per-page change

        const params = new URLSearchParams();

        Object.entries(newValues).forEach(([key, value]) => {
            // FIX: Only set param if value exists and is not 'skip'
            if (value && key !== 'skip') params.set(key, String(value));
        });

        if (isFilterChanged) {
            params.set('page', '1');
        }

        const newQuery = params.toString();
        if (newQuery !== searchParams.toString()) {
            router.replace(`${pathname}?${newQuery}`, { scroll: false });
        }
    };

    // EVENT HANDLERS
    const onRowItemClicked = useCallback((item: Warehouse) => {
        setSelectedId(item?.id);
        setOpen(true);
    }, []);

    const columnDefs: ColumnDef<Warehouse>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: t('warehouses.list_page.table.name'),
                cell: ({ row }) => (
                    <div
                        className="font-medium w-[230px] truncate cursor-pointer"
                        onClick={() => onRowItemClicked(row.original)}
                    >
                        {row.getValue('name')}
                    </div>
                )
            },
            {
                accessorKey: 'address',
                header: t('warehouses.list_page.table.address'),
                cell: ({ row }) => {
                    const address = row.getValue('address') as string;
                    return (
                        <div
                            className="w-[400px] truncate cursor-pointer"
                            title={address}
                            onClick={() => onRowItemClicked(row.original)}
                        >
                            {address}
                        </div>
                    );
                }
            },
            {
                // We use id instead of accessorKey when combining multiple fields
                id: 'phoneNumbers',
                header: t('warehouses.list_page.table.phone'),
                cell: ({ row }) => {
                    const { primaryPhone } = row.original;

                    return (
                        <div
                            className="flex flex-col gap-0.5 min-w-[150px] cursor-pointer"
                            onClick={() => onRowItemClicked(row.original)}
                        >
                            <p className="text-sm font-medium text-gray-900">
                                {formatPhone(primaryPhone) || 'N/A'}
                            </p>
                        </div>
                    );
                }
            },
            {
                accessorKey: 'createDate',
                header: t('warehouses.list_page.table.created_date'),
                cell: ({ row }) => {
                    return (
                        <span
                            onClick={() => onRowItemClicked(row.original)}
                            className="cursor-pointer"
                        >
                            {getFormattedDate(row.getValue('createDate'))}
                        </span>
                    );
                }
            },
            {
                accessorKey: 'status',
                header: t('warehouses.list_page.table.status'),
                cell: ({ row }) => {
                    const status = Number(row.getValue('status'));
                    const statusObj = getWHStatusColor(status);
                    return (
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onRowItemClicked(row.original)}
                        >
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
                header: t('warehouses.list_page.table.actions'),
                cell: ({ row }) => (
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                    >
                        <Link
                            href={`/dashboard/warehouse/edit/${row.original.id}`}
                        >
                            <SquarePen className="h-4 w-4" />
                        </Link>
                    </Button>
                )
            }
        ],
        [onRowItemClicked, t]
    );

    return (
        <BaseForm
            schema={warehouseListSchema}
            defaultValues={currentParamsFromUrl}
            onChange={handleFormChange}
        >
            <div className="p-8 flex flex-col h-full">
                <ListPageTitleComponent
                    title={t('warehouses.list_page.title')}
                    createHref="/dashboard/warehouse/create"
                    createLabel={t('warehouses.list_page.create_btn')}
                    showCreateButton={true}
                />

                <div className="py-2.5 flex-[1_1_auto]">
                    {isFetching && !isFetchedAfterMount && (
                        <div className="p-6 text-center">
                            {t('warehouses.list_page.empty_state.loading')}
                        </div>
                    )}

                    {(!isFetching || isFetchedAfterMount) && data && (
                        <>
                            <ListDataTableComponent
                                data={data && data.value}
                                columns={columnDefs}
                                filteredKeys={[
                                    'searchText',
                                    'fromDate',
                                    'toDate'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image={'/nodata/warehouse.svg'}
                                    title_no_data={t(
                                        'warehouses.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'warehouses.list_page.empty_state.description'
                                    )}
                                    createHref="/dashboard/warehouse/create"
                                    createLabel={t(
                                        'warehouses.list_page.create_btn'
                                    )}
                                />
                            </ListDataTableComponent>

                            <div className="border bg-white rounded-lg p-4 mt-2.5">
                                <ListPaginationComponent
                                    totalCount={data?.totalCount}
                                />
                            </div>
                        </>
                    )}
                </div>

                {selectedId !== null && (
                    <WarehouseViewDetails
                        open={open}
                        onOpenChange={setOpen}
                        warehouseId={selectedId}
                    />
                )}
            </div>
        </BaseForm>
    );
}

export default function WarehouseListPage() {
    return (
        <Suspense>
            <WarehouseList />
        </Suspense>
    );
}
