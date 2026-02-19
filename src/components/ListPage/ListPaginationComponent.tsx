'use client';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink
} from '@/components/ui/pagination';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useMemo } from 'react';

interface ListPaginationComponentProps {
    totalCount: number;
}

export function ListPaginationComponent({
    totalCount
}: ListPaginationComponentProps) {
    const { watch, setValue } = useFormContext();

    // ✅ Watch RHF fields for live updates
    const page = watch('page') || 1;
    const top = watch('top') || 15;

    // ✅ Calculate total pages
    const totalPages = Math.max(1, Math.ceil(totalCount / top));

    // ✅ Clamp page number if user selects perPage that reduces total pages
    if (page > totalPages) setValue('page', totalPages);

    // ✅ Compute visible page numbers with ellipsis
    const pagesToShow = useMemo(() => {
        const delta = 2;
        const pages: (number | 'dots')[] = [];
        for (
            let i = Math.max(1, page - delta);
            i <= Math.min(totalPages, page + delta);
            i++
        ) {
            pages.push(i);
        }
        if (page - delta > 2) pages.unshift('dots');
        if (page + delta < totalPages - 1) pages.push('dots');
        if (page - delta > 1) pages.unshift(1);
        if (page + delta < totalPages) pages.push(totalPages);
        return pages;
    }, [page, totalPages]);

    // ✅ Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setValue('page', newPage, { shouldValidate: true, shouldDirty: true });
    };

    // ✅ Display range (e.g., 16–30 of 100)
    const startItem = (page - 1) * top + 1;
    const endItem = Math.min(page * top, totalCount);

    return (
        <div className="flex items-center justify-between">
            {/* Left side: Rows per page */}
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                <span>Rows per page:</span>
                <FormField
                    name="top"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Select
                                    value={String(field.value ?? top)}
                                    onValueChange={(val) => {
                                        const newTop = Number(val);
                                        field.onChange(newTop);
                                        setValue('page', 1); // reset to first page when per-page changes
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-17.5">
                                        <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {[15, 30, 50].map((item) => (
                                                <SelectItem
                                                    key={item}
                                                    value={String(item)}
                                                >
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <span>
                    {totalCount > 0
                        ? `${startItem}-${endItem} of ${totalCount}`
                        : '0 of 0'}
                </span>
            </div>

            {/* Right side: Pagination controls */}
            <div className="flex items-center">
                <Pagination>
                    <PaginationContent className="gap-0.5">
                        {/* First */}
                        <PaginationItem>
                            <PaginationLink
                                size="icon"
                                onClick={() => handlePageChange(1)}
                                disabled={page <= 1}
                            >
                                <ChevronsLeft />
                            </PaginationLink>
                        </PaginationItem>

                        {/* Prev */}
                        <PaginationItem>
                            <PaginationLink
                                size="icon"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                            >
                                <ChevronLeftIcon />
                            </PaginationLink>
                        </PaginationItem>

                        {/* Pages */}
                        {pagesToShow.map((p, i) =>
                            p === 'dots' ? (
                                <PaginationItem key={`dots-${i}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(p)}
                                        isActive={p === page}
                                        size="icon"
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        {/* Next */}
                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                size="icon"
                            >
                                <ChevronRightIcon />
                            </PaginationLink>
                        </PaginationItem>

                        {/* Last */}
                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(totalPages)}
                                disabled={page >= totalPages}
                                size="icon"
                            >
                                <ChevronsRight />
                            </PaginationLink>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
