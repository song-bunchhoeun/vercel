'use client';

import BaseForm from '@/components/BaseForm/BaseForm';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import { CustomerListParams, useGetListCustomers } from '@/hooks/useCustomers';
import { getFormattedDate } from '@/lib/dayjs';
import { formatPhone } from '@/lib/utils';
import { CustomerData } from '@/models/response.model';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';

// ✅ Fixed: Added missing fields to Zod schema to prevent validation failures
const customerListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    top: z.number(),
    page: z.number(),
    status: z.number().nullable().optional(),
    customerId: z.string().optional()
});

export function CustomerList() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const defaultListValues: CustomerListParams = useMemo(
        () => ({
            searchText: searchParams.get('searchText') ?? '',
            fromDate: searchParams.get('fromDate') ?? '',
            toDate: searchParams.get('toDate') ?? '',
            top: Number(searchParams.get('top') ?? 15),
            page: Number(searchParams.get('page') ?? 1),
            status: searchParams.get('status')
                ? Number(searchParams.get('status'))
                : null,
            customerId: searchParams.get('customerId') ?? ''
        }),
        [searchParams]
    );

    const [formData, setFormData] =
        useState<CustomerListParams>(defaultListValues);
    const { data, isFetching, isFetchedAfterMount } =
        useGetListCustomers(formData);
    const customers = useMemo(() => data?.value || [], [data?.value]);

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        });
        window.history.replaceState(
            null,
            '',
            `${pathname}?${params.toString()}`
        );
    }, [pathname, formData]);

    const columnDef = useMemo<ColumnDef<CustomerData>[]>(
        () => [
            {
                accessorKey: 'id',
                header: t('customers.list_page.table.id'),
                cell: ({ row }) => (
                    <div className="font-medium w-24 truncate">
                        #{row.original.id}
                        {/* {row.original.id.slice(-8).toUpperCase()} */}
                    </div>
                )
            },
            {
                accessorKey: 'name',
                header: t('customers.list_page.table.name'),
                cell: ({ row }) => (
                    <div className="font-medium w-24 truncate">
                        {row.original.name}
                    </div>
                )
            },
            {
                id: 'deliveryAddress',
                header: t('customers.list_page.table.main_address'),
                cell: ({ row }) => {
                    const mainAddr = row.original.addresses?.[0];
                    return (
                        <div className="flex flex-col justify-center py-1 max-w-75">
                            <span className="font-medium">
                                {mainAddr?.label || 'No Label'}
                            </span>
                            <div className="truncate">
                                {mainAddr?.line || (
                                    <span className="italic">
                                        No address provided
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                }
            },
            {
                accessorKey: 'primaryPhone',
                header: t('customers.list_page.table.phone'),
                cell: ({ row }) => (
                    <div className="font-medium">
                        {formatPhone(row.original.primaryPhone ?? '')}
                    </div>
                )
            },
            {
                accessorKey: 'dateCreate',
                header: t('customers.list_page.table.joined_date'),
                cell: ({ row }) => {
                    return (
                        <div className="text-sm">
                            {row.original.dateCreate
                                ? getFormattedDate(row.original.dateCreate)
                                : '—'}
                        </div>
                    );
                }
            },
            {
                accessorKey: 'totalShipments',
                header: t('customers.list_page.table.total_orders'),
                cell: ({ row }) => (
                    <div className="font-bold text-center w-24">
                        {row.original.totalShipments || 0}
                    </div>
                )
            }
        ],
        [t]
    );

    const onRowItemClicked = (item: CustomerData) => {
        router.push(`/dashboard/customers/detail/${item.id}`);
    };

    return (
        <BaseForm
            schema={customerListSchema}
            defaultValues={defaultListValues}
            onChange={setFormData}
        >
            <div className="p-8 flex flex-col h-full gap-6">
                <ListPageTitleComponent
                    title={t('customers.list_page.title')}
                    createHref="/dashboard/customers/create"
                    showCreateButton={false}
                />

                <div className="flex-1">
                    {isFetching && !isFetchedAfterMount ? (
                        <div className="flex h-64 w-full items-center justify-center bg-white rounded-2xl border">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <ListDataTableComponent
                                data={customers}
                                columns={columnDef}
                                onRowItemClicked={onRowItemClicked}
                                filteredKeys={[
                                    'searchText',
                                    'fromDate',
                                    'toDate',
                                    'status',
                                    'customerId'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image={'/nodata/customer.svg'}
                                    title_no_data={t(
                                        'customers.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'customers.list_page.empty_state.description'
                                    )}
                                    createHref="/dashboard/customers/create"
                                />
                            </ListDataTableComponent>

                            <div className="bg-white rounded-xl border p-4 mt-4 shadow-sm">
                                <ListPaginationComponent
                                    totalCount={data?.totalCount || 0}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BaseForm>
    );
}
