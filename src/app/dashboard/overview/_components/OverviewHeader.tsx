'use client';

import ImportBulkButton from '@/app/dashboard/shipments/bulk/ImportBulkButton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useWarehouses } from '@/hooks/useWarehouses';
import { getFormattedDate, MDayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronDown, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface OverviewHeaderProps {
    onFilterChange?: (filters: {
        timeRange?: string;
        warehouse?: string;
        dateRange?: DateRange;
        fromDate?: string;
        toDate?: string;
        warehouseIds?: string[] | null;
    }) => void;
}

// --- Constants ---
const TIME_RANGES = [
    { labelKey: 'dashboard.overview.filters.time_ranges.24h', value: '24h' },
    { labelKey: 'dashboard.overview.filters.time_ranges.7d', value: '7d' },
    { labelKey: 'dashboard.overview.filters.time_ranges.60d', value: '60d' },
    { labelKey: 'dashboard.overview.filters.time_ranges.6m', value: '6m' }
] as const;

const WAREHOUSE_LIMIT = 20;

const API_DATE_FORMAT = 'YYYY-MM-DD';

// --- Helper Functions ---
const calculateDatesFromTimeRange = (range: string) => {
    let now = MDayjs();
    const toDate = MDayjs().format(API_DATE_FORMAT);

    switch (range) {
        case '24h':
            now = now.subtract(24, 'hour');
            break;
        case '7d':
            now = now.subtract(7, 'day');
            break;
        case '60d':
            now = now.subtract(60, 'day');
            break;
        case '6m':
            now = now.subtract(6, 'month');
            break;
        default:
            now = now.subtract(24, 'hour');
    }

    const fromDate = now.format(API_DATE_FORMAT);

    return { fromDate, toDate };
};

// --- Main Component ---
export const OverviewHeader = ({ onFilterChange }: OverviewHeaderProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined
    );
    const [warehousePopoverOpen, setWarehousePopoverOpen] = useState(false);

    // Fetch warehouses from API
    const { data: warehouseData, isLoading: isLoadingWarehouses } =
        useWarehouses({
            top: 9999,
            page: 1
        });

    const warehouses = useMemo(
        () => warehouseData?.value || [],
        [warehouseData]
    );

    // Generate condensed warehouse display text
    const warehouseDisplayText = useMemo(() => {
        if (selectedWarehouses.length === 0) {
            return t('dashboard.overview.filters.all_warehouses');
        }

        const selectedNames = warehouses
            .filter((wh) => selectedWarehouses.includes(wh.id))
            .map((wh) => wh.name);

        if (selectedNames.length <= 2) {
            return selectedNames.join(', ');
        }

        const firstTwo = selectedNames.slice(0, 2).join(', ');
        const remaining = selectedNames.length - 2;
        return `${firstTwo} +${remaining}`;
    }, [selectedWarehouses, warehouses, t]);

    // Effect to trigger filter change when any filter updates
    useEffect(() => {
        let fromDate = '';
        let toDate = '';

        // Priority: Custom date range > Time range preset
        if (dateRange?.from || dateRange?.to) {
            fromDate = dateRange.from
                ? MDayjs(dateRange.from).format(API_DATE_FORMAT)
                : '';
            toDate = dateRange.to
                ? MDayjs(dateRange.to).format(API_DATE_FORMAT)
                : '';
        } else if (timeRange) {
            const dates = calculateDatesFromTimeRange(timeRange);
            fromDate = dates.fromDate;
            toDate = dates.toDate;
        }

        const warehouseIds =
            selectedWarehouses.length === 0 ? null : selectedWarehouses;

        onFilterChange?.({
            timeRange,
            warehouse: warehouseIds ? warehouseIds.join(',') : 'all',
            dateRange,
            fromDate,
            toDate,
            warehouseIds
        });
    }, [timeRange, selectedWarehouses, dateRange, onFilterChange]);

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
        // Clear custom date range when selecting a preset
        setDateRange(undefined);
    };

    const handleWarehouseToggle = (warehouseId: string) => {
        setSelectedWarehouses((prev) => {
            if (prev.includes(warehouseId)) {
                return prev.filter((id) => id !== warehouseId);
            }
            if (prev.length >= WAREHOUSE_LIMIT) return prev;
            return [...prev, warehouseId];
        });
    };

    const handleClearWarehouses = () => {
        setSelectedWarehouses([]);
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        // Clear time range preset when selecting custom dates
        if (range?.from || range?.to) {
            setTimeRange('');
        }
    };

    const dateRangeAriaLabel = useMemo(() => {
        if (dateRange?.from) {
            const start = getFormattedDate(dateRange.from);
            const end = dateRange.to
                ? ` - ${getFormattedDate(dateRange.to)}`
                : '';
            return t('dashboard.overview.filters.selected_date_range', {
                start,
                end
            });
        }
        return t('dashboard.overview.filters.date_range_aria');
    }, [dateRange, t]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header Top Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {t('dashboard.overview.title')}
                    </h1>
                    <p className="text-base text-muted-foreground">
                        {t('dashboard.overview.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportBulkButton
                        buttonText={t('dashboard.overview.import_bulk')}
                        className="h-11 border-mdisabled border text-secondary-foreground bg-white hover:text-hover hover:bg-neutral-100 cursor-pointer active:bg-accent2"
                        onImportSuccess={(parsed) => {
                            sessionStorage.setItem(
                                'bulkImportData',
                                JSON.stringify(parsed)
                            );
                            router.push('/dashboard/shipments/bulk');
                        }}
                    />
                    <Button
                        type="button"
                        className="text-white cursor-pointer h-11"
                        aria-label={t('dashboard.overview.create_shipment')}
                    >
                        <Link
                            href="/dashboard/shipments/create"
                            className="flex items-center gap-2"
                        >
                            <Plus size={40} aria-hidden="true" />
                            {''}
                            {t('dashboard.overview.create_shipment')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Header Filter Row */}
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2"
                role="search"
                aria-label={t('dashboard.overview.filters.aria_label')}
            >
                <div className="flex items-center gap-2">
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(v) => v && handleTimeRangeChange(v)}
                        className="bg-white rounded-xl border-neutral-200 border shadow-none"
                        aria-label={t('dashboard.overview.filters.time_range')}
                    >
                        {TIME_RANGES.map((opt) => (
                            <ToggleGroupItem
                                key={opt.value}
                                value={opt.value}
                                className={cn(
                                    'h-10 text-xs font-bold rounded-lg transition-all border-r shadow-none cursor-pointer',
                                    'data-[state=on]:bg-neutral-200 data-[state=on]:text-black data-[state=on]:shadow-sm',
                                    'data-[state=off]:text-secondary-foreground data-[state=off]:hover:bg-neutral-100'
                                )}
                                aria-label={t(
                                    'dashboard.overview.filters.filter_by',
                                    {
                                        range: t(opt.labelKey)
                                    }
                                )}
                            >
                                {t(opt.labelKey)}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="flex items-center gap-3">
                    {/* Multi-select Warehouse Filter */}
                    <Popover
                        open={warehousePopoverOpen}
                        onOpenChange={setWarehousePopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                type="button"
                                className="h-11 justify-start border cursor-pointer text-neutral-600 bg-white hover:bg-neutral-100 hover:text-hover"
                                disabled={isLoadingWarehouses}
                                aria-label={t(
                                    'dashboard.overview.filters.select_warehouses'
                                )}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="font-medium text-gray-700">
                                        {t(
                                            'dashboard.overview.filters.warehouse_label'
                                        )}
                                    </span>
                                    <Separator
                                        orientation="vertical"
                                        className="min-h-5 text-gray-700"
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm truncate flex-1 text-left">
                                        {warehouseDisplayText}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className="text-muted-foreground ml-2"
                                    aria-hidden="true"
                                />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 z-1100" align="end">
                            <div className="flex items-center justify-between p-3 border-b">
                                <span className="font-semibold text-sm">
                                    {t(
                                        'dashboard.overview.filters.select_warehouses'
                                    )}
                                </span>
                                {selectedWarehouses.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearWarehouses}
                                        className="h-auto p-1 text-xs"
                                    >
                                        <X size={14} className="mr-1" />
                                        {t('dashboard.overview.filters.clear')}
                                    </Button>
                                )}
                            </div>
                            <ScrollArea className="max-h-75 overflow-y-scroll">
                                <div className="p-2">
                                    <div
                                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        onClick={() =>
                                            setSelectedWarehouses([])
                                        }
                                    >
                                        <Checkbox
                                            checked={
                                                selectedWarehouses.length === 0
                                            }
                                            onCheckedChange={() =>
                                                setSelectedWarehouses([])
                                            }
                                        />
                                        <label className="text-sm cursor-pointer flex-1 font-medium">
                                            {t(
                                                'dashboard.overview.filters.select_all'
                                            )}
                                        </label>
                                    </div>
                                    {warehouses.map((warehouse) => {
                                        const isSelected =
                                            selectedWarehouses.includes(
                                                warehouse.id
                                            );
                                        const isDisabled =
                                            selectedWarehouses.length >=
                                                WAREHOUSE_LIMIT && !isSelected;

                                        return (
                                            <div
                                                key={warehouse.id}
                                                className={cn(
                                                    'flex items-center space-x-2 p-2 rounded cursor-pointer',
                                                    isDisabled
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-gray-50'
                                                )}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    handleWarehouseToggle(
                                                        warehouse.id
                                                    )
                                                }
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    onCheckedChange={() =>
                                                        handleWarehouseToggle(
                                                            warehouse.id
                                                        )
                                                    }
                                                />
                                                <label
                                                    className={cn(
                                                        'text-sm flex-1',
                                                        !isDisabled &&
                                                            'cursor-pointer'
                                                    )}
                                                >
                                                    {warehouse.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                type="button"
                                className="h-11 w-fit justify-start border cursor-pointer text-neutral-600 bg-white hover:bg-neutral-100 hover:text-hover"
                                aria-label={dateRangeAriaLabel}
                            >
                                <div className="flex gap-2">
                                    <CalendarIcon
                                        size={20}
                                        className="text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {!dateRange?.from && !dateRange?.to && (
                                            <span className="font-normal text-mtertiary">
                                                {t(
                                                    'dashboard.overview.filters.select_dates'
                                                )}
                                            </span>
                                        )}

                                        {dateRange?.from &&
                                            getFormattedDate(dateRange.from)}
                                        {dateRange?.to && (
                                            <>
                                                {' '}
                                                -{' '}
                                                {getFormattedDate(
                                                    dateRange?.to
                                                )}
                                            </>
                                        )}
                                    </span>
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 z-1100"
                            align="end"
                        >
                            <Calendar
                                autoFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};
