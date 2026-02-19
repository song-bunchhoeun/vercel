'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    Row,
    useReactTable,
    type ColumnDef,
    type RowSelectionState,
    type SortingState
} from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ListDataTableProps<TData, TValue> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    className?: string;
    onRowItemClicked?: (row: TData) => void | undefined;
    sorting?: SortingState;
    setSorting?: Dispatch<SetStateAction<SortingState>>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
    enableRowSelection?: boolean;
    borderTable?: boolean;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: Dispatch<SetStateAction<ColumnFiltersState>>;
    filteredKeys?: string[];
    children?: React.ReactNode;
    getRowId?:
        | ((
              originalRow: TData,
              index: number,
              parent?: Row<TData> | undefined
          ) => string)
        | undefined;
}

export function ListDataTable<TData, TValue>({
    data,
    columns,
    className,
    rowSelection,
    columnFilters,
    onRowItemClicked,
    borderTable = false,
    onRowSelectionChange,
    onColumnFiltersChange,
    filteredKeys = [],
    getRowId,
    children
}: ListDataTableProps<TData, TValue>) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
        state: {
            rowSelection,
            columnFilters
        },
        onRowSelectionChange: onRowSelectionChange,
        onColumnFiltersChange: onColumnFiltersChange,
        getRowId: getRowId
    });

    const isFiltered = useMemo(() => {
        return filteredKeys.some((key) => {
            const value = searchParams.get(key);
            return value !== null && value !== '';
        });
    }, [searchParams, filteredKeys]);

    return (
        <>
            <div className={cn(`border bg-white rounded-lg`, className)}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            borderTable &&
                                                'border justify-center',
                                            'p-[20px_16px]'
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length > 0 &&
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={
                                        onRowItemClicked
                                            ? () =>
                                                  onRowItemClicked(row.original)
                                            : undefined
                                    }
                                    className={cn(
                                        'hover:bg-accent2 active:bg-accent',
                                        onRowItemClicked ? 'cursor-pointer' : ''
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                borderTable
                                                    ? 'border'
                                                    : 'p-[10px_16px]'
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        {table.getRowModel().rows.length === 0 && (
                            <>
                                {isFiltered && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="text-center py-6"
                                        >
                                            {t('common.empty_state.not_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {table.getRowModel().rows.length === 0 && !isFiltered && (
                <>{children}</>
            )}
        </>
    );
}

export function ListDataTableComponent<TData, TValue>(
    props: ListDataTableProps<TData, TValue>
) {
    return (
        <Suspense>
            <ListDataTable {...props} />
        </Suspense>
    );
}
