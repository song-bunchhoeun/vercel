'use client';

import { UserResponseData } from '@/app/dashboard/user/(form)/user.form.service';
import UserViewDetails from '@/app/dashboard/user/userViewDetails';
import BaseForm from '@/components/BaseForm/BaseForm';
import { ListDataTableComponent } from '@/components/ListPage/ListDataTableComponent';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { ListPaginationComponent } from '@/components/ListPage/ListPaginationComponent';
import QRGeneratDialog from '@/components/QRCode/QRGenerateDialog';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
import { ListFormValues, useGetListUsers } from '@/hooks/useUsers';
import { getFormattedDate } from '@/lib/dayjs';
import { getUserStatusColor } from '@/lib/user-status';
import { cn, formatPhone } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { ScanQrCode, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';

const userListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    roleId: z.number().nullable().optional(),
    top: z.number().default(15),
    page: z.number().default(1)
});

const ROLES = (t: TFunction) => [
    { label: t('users.list_page.filters.role_all'), value: 'all' },
    { label: t('users.list_page.filters.role_admin'), value: '2' },
    { label: t('users.list_page.filters.role_user'), value: '3' }
];

export function UserList() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter(); // Use Next.js router for consistent behavior
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [qrValue, setQrValue] = useState<string | null>(null);

    // 2. Derive state from URL (Single Source of Truth)
    const currentParamsFromUrl: ListFormValues = useMemo(
        () => ({
            searchText: searchParams.get('searchText') ?? '',
            fromDate: searchParams.get('fromDate') ?? '',
            toDate: searchParams.get('toDate') ?? '',
            top: Number(searchParams.get('top') ?? 15),
            page: Number(searchParams.get('page') ?? 1),
            roleId: searchParams.get('roleId')
                ? Number(searchParams.get('roleId'))
                : null
        }),
        [searchParams]
    );

    const [formData, setFormData] =
        useState<ListFormValues>(currentParamsFromUrl);
    const { data, isFetching, isFetchedAfterMount } = useGetListUsers(formData);

    // 3. Centralized Change Handler (Handles the "Reset to Page 1" logic)
    const handleFormChange = (newValues: ListFormValues) => {
        const isFilterChanged =
            newValues.searchText !== formData.searchText ||
            newValues.fromDate !== formData.fromDate ||
            newValues.toDate !== formData.toDate ||
            newValues.roleId !== formData.roleId;

        const updatedValues = {
            ...newValues,
            page: isFilterChanged ? 1 : newValues.page
        };

        setFormData(updatedValues);
    };

    // 4. Unified URL Syncing
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

    const columnDefs: ColumnDef<UserResponseData>[] = useMemo(
        () => [
            {
                accessorKey: 'profileUrl',
                header: t('users.list_page.table.profile'),
                cell: ({ row }) => {
                    const { profileUrl, username } = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage
                                    src={profileUrl ?? '/no_image_data.png'}
                                    alt={username}
                                    className="object-cover"
                                />
                            </Avatar>

                            <h2 className="font-medium text-sm w-57.5 truncate">
                                {username}
                            </h2>
                        </div>
                    );
                }
            },
            {
                accessorKey: 'isAdmin',
                header: t('users.list_page.table.role'),
                cell: ({ row }) => {
                    const isAdmin = row.original.isAdmin;
                    const role = isAdmin
                        ? t('users.list_page.table.admin')
                        : t('users.list_page.table.user');
                    return <div className="font-medium">{role}</div>;
                }
            },
            {
                accessorKey: 'warehouse',
                header: t('users.list_page.table.warehouse'),
                cell: ({ row }) => {
                    const warehouse = row.original.warehouse;
                    return (
                        <div className="font-medium w-50 truncate">
                            {warehouse?.name ??
                                t('users.list_page.table.all_warehouses')}
                        </div>
                    );
                }
            },
            {
                accessorKey: 'loginPhone',
                header: t('users.list_page.table.phone'),
                cell: ({ row }) => (
                    <div>{formatPhone(row.getValue('loginPhone') ?? '')}</div>
                )
            },
            {
                accessorKey: 'dateCreate',
                header: t('users.list_page.table.created_date'),
                cell: ({ row }) => {
                    return getFormattedDate(row.getValue('dateCreate'));
                }
            },
            {
                accessorKey: 'status',
                header: t('users.list_page.table.status'),
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
                header: t('users.list_page.table.actions'),
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <div className="flex gap-2">
                            {status !== 0 && status !== 1 ? (
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
                                    <ScanQrCode />
                                </Button>
                            ) : (
                                ''
                            )}
                            <Link
                                onClick={(e) => e.stopPropagation()}
                                href={`/dashboard/user/edit/${row.original.id}`}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
                                >
                                    <SquarePen />
                                </Button>
                            </Link>
                        </div>
                    );
                }
            }
        ],
        [t]
    );

    const onRowItemClicked = (item: UserResponseData) => {
        setSelectedId(item.id);
        setOpen(true);
    };

    const handleQRClick = (item: UserResponseData) => {
        setQrValue(item.dynamicActiveurl);
        setOpenQrDialog(true);
    };

    return (
        <BaseForm
            schema={userListSchema}
            defaultValues={currentParamsFromUrl}
            onChange={handleFormChange}
        >
            <div className="p-8 flex flex-col h-full">
                <ListPageTitleComponent
                    title={t('users.list_page.title')}
                    createHref="/dashboard/user/create"
                    createLabel={t('users.list_page.create_btn')}
                    showCreateButton={true} // Always allow creation
                    filterItem={
                        <FormField
                            name="roleId"
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
                                                field.value
                                                    ? String(field.value)
                                                    : 'all'
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-700">
                                                        {t(
                                                            'users.list_page.filters.role_label'
                                                        )}
                                                    </span>
                                                    <Separator
                                                        orientation="vertical"
                                                        className="min-h-[20px] text-gray-700"
                                                    />
                                                    <SelectValue
                                                        placeholder={t(
                                                            'users.list_page.filters.role_all'
                                                        )}
                                                    />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES(t).map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
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
                        <div className="p-6 text-center">
                            {t('users.list_page.empty_state.loading')}
                        </div>
                    )}

                    {(!isFetching || isFetchedAfterMount) && data && (
                        <>
                            <ListDataTableComponent
                                data={data && data.value}
                                columns={columnDefs}
                                onRowItemClicked={onRowItemClicked}
                                filteredKeys={[
                                    'searchText',
                                    'fromDate',
                                    'toDate',
                                    'roleId'
                                ]}
                            >
                                <ListEmptyDataComponent
                                    image={'/nodata/user.svg'}
                                    title_no_data={t(
                                        'users.list_page.empty_state.title'
                                    )}
                                    subtitle_no_data={t(
                                        'users.list_page.empty_state.description'
                                    )}
                                    createHref="/dashboard/user/create"
                                    createLabel={t(
                                        'users.list_page.create_btn'
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

                <UserViewDetails
                    open={open}
                    onOpenChange={setOpen}
                    userId={selectedId}
                />

                <QRGeneratDialog
                    open={openQrDialog}
                    onOpenChange={(isOpen) => {
                        setOpenQrDialog(isOpen);
                        // Clean up when closing to prevent "ghosting"
                        if (!isOpen) setQrValue(null);
                    }}
                    qrType={t('users.list_page.scan_qr')}
                    value={qrValue ?? ''} // Ensure it never gets 'null' during transition
                />
            </div>
        </BaseForm>
    );
}
