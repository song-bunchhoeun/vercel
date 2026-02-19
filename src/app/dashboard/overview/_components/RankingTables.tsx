'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { useDashboardRankingList } from '@/hooks/useDashboard';
import { ArrowDown, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface RankingTablesProps {
    fromDate?: string;
    toDate?: string;
    warehouseIds?: string[] | null;
}

interface RankingColumn {
    header: string;
    accessorKey: string;
    className?: string;
}

interface RankingTableProps<T> {
    data: T[];
    columns: RankingColumn[];
}

interface InfoTooltipProps {
    title: string;
    description: string;
}

interface RankingCardProps {
    title: string;
    tooltipTitle: string;
    tooltipDescription: string;
    isLoading: boolean;
    hasData: boolean;
    isPlaceholderData: boolean;
    showSeeMore: boolean;
    onSeeMore: () => void;
    children: React.ReactNode;
}

// --- Sub-components ---
export const InfoTooltip = ({ title, description }: InfoTooltipProps) => {
    const { t } = useTranslation();
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        className="focus:outline-none focus:ring-2 focus:ring-mariner-500 rounded"
                        aria-label={t('dashboard.overview.stats.info_aria', {
                            title
                        })}
                    >
                        <Info className="h-4 w-4 text-mariner-500" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="w-84 gap-1 p-3 flex flex-col text-xs">
                    <p className="font-bold">{title}</p>
                    <p className="font-normal">{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const RankingContent = ({
    isLoading,
    hasData,
    children,
    showSeeMore,
    isPlaceholderData,
    onSeeMore
}: {
    isLoading: boolean;
    hasData: boolean;
    children: React.ReactNode;
    showSeeMore: boolean;
    isPlaceholderData: boolean;
    onSeeMore: () => void;
}) => {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="h-75 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                    {t('dashboard.overview.rankings.loading')}
                </span>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="h-75 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                    {t('dashboard.overview.rankings.no_data')}
                </span>
            </div>
        );
    }

    return (
        <ScrollArea className="h-auto max-h-150">
            <div className="p-6 pt-0">
                {children}

                {showSeeMore && (
                    <div className="pt-4 flex justify-center w-full">
                        <button
                            onClick={onSeeMore}
                            disabled={isPlaceholderData}
                            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPlaceholderData
                                ? t('dashboard.overview.rankings.loading')
                                : t(
                                      'dashboard.overview.rankings.see_more'
                                  )}{' '}
                            <ChevronDown size={14} />
                        </button>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};

const RankingCard = ({
    title,
    tooltipTitle,
    tooltipDescription,
    isLoading,
    hasData,
    isPlaceholderData,
    showSeeMore,
    onSeeMore,
    children
}: RankingCardProps) => {
    return (
        <Card className="flex flex-col border-neutral-100">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    {title}
                    <InfoTooltip
                        title={tooltipTitle}
                        description={tooltipDescription}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <RankingContent
                    isLoading={isLoading}
                    hasData={hasData}
                    showSeeMore={showSeeMore}
                    isPlaceholderData={isPlaceholderData}
                    onSeeMore={onSeeMore}
                >
                    {children}
                </RankingContent>
            </CardContent>
        </Card>
    );
};

const GenericRankingTable = <T extends Record<string, unknown>>({
    data,
    columns
}: RankingTableProps<T>) => (
    <Table className="border border-neutral-200">
        <TableHeader className="bg-mariner-50">
            <TableRow className="border-b border-neutral-200">
                {columns.map((col, index) => (
                    <TableHead
                        key={index}
                        className={`text-sm text-foreground font-bold p-4 border-r border-neutral-200 last:border-r-0 ${col.className || ''}`}
                    >
                        {col.header}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((row, rowIndex) => (
                <TableRow
                    key={rowIndex}
                    className="border-b border-neutral-200 last:border-0 hover:bg-transparent"
                >
                    {columns.map((col, colIndex) => (
                        <TableCell
                            key={colIndex}
                            className="text-sm p-4 text- font-medium border-r border-neutral-200 last:border-r-0"
                        >
                            {
                                (row as Record<string, React.ReactNode>)[
                                    col.accessorKey
                                ]
                            }
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

// --- Main Component ---
export const RankingTables = ({
    fromDate,
    toDate,
    warehouseIds
}: RankingTablesProps) => {
    const { t } = useTranslation();
    const [driverLimit, setDriverLimit] = useState(5);
    const [customerLimit, setCustomerLimit] = useState(5);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch ranking data
    const {
        data: rankingData,
        isLoading,
        isPlaceholderData
    } = useDashboardRankingList({
        fromDate,
        toDate,
        warehouseIds,
        driverRank: (driverLimit + 5).toString(),
        customerRank: (customerLimit + 5).toString()
    });

    const drivers = rankingData?.topDrivers || [];
    const customers = rankingData?.topCustomers || [];

    const handleToggleExpand = () => {
        if (isExpanded) {
            setDriverLimit(5);
            setCustomerLimit(5);
            setIsExpanded(false);
        } else {
            setDriverLimit(10);
            setCustomerLimit(10);
            setIsExpanded(true);
        }
    };

    const hasDriverData = !isLoading && drivers.length > 0;
    const hasCustomerData = !isLoading && customers.length > 0;

    const driverColumns: RankingColumn[] = [
        {
            header: t('dashboard.overview.rankings.headers.rank'),
            accessorKey: 'rank',
            className: 'w-[80px]'
        },
        {
            header: t('dashboard.overview.rankings.headers.driver_name'),
            accessorKey: 'driverName'
        },
        {
            header: t('dashboard.overview.rankings.headers.total_orders'),
            accessorKey: 'totalOrders'
        }
    ];

    const customerColumns: RankingColumn[] = [
        {
            header: t('dashboard.overview.rankings.headers.customer_name'),
            accessorKey: 'customerName'
        },
        {
            header: t('dashboard.overview.rankings.headers.phone_number'),
            accessorKey: 'phoneNumber'
        },
        {
            header: t('dashboard.overview.rankings.headers.total_orders'),
            accessorKey: 'totalOrders'
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                    {t('dashboard.overview.rankings.drivers_customers')}
                </h2>
                <button
                    onClick={handleToggleExpand}
                    className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline focus:outline-none cursor-pointer"
                >
                    {isExpanded
                        ? t('dashboard.overview.rankings.show_less')
                        : t('dashboard.overview.rankings.show_more')}{' '}
                    <ArrowDown
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <RankingCard
                    title={t('dashboard.overview.rankings.drivers_title')}
                    tooltipTitle={t(
                        'dashboard.overview.rankings.drivers_tooltip'
                    )}
                    tooltipDescription={t(
                        'dashboard.overview.rankings.drivers_desc'
                    )}
                    isLoading={isLoading}
                    hasData={hasDriverData}
                    isPlaceholderData={isPlaceholderData}
                    showSeeMore={false}
                    onSeeMore={() => {}}
                >
                    <GenericRankingTable
                        data={drivers.slice(0, driverLimit)}
                        columns={driverColumns}
                    />
                </RankingCard>

                <RankingCard
                    title={t('dashboard.overview.rankings.customers_title')}
                    tooltipTitle={t(
                        'dashboard.overview.rankings.customers_tooltip'
                    )}
                    tooltipDescription={t(
                        'dashboard.overview.rankings.customers_desc'
                    )}
                    isLoading={isLoading}
                    hasData={hasCustomerData}
                    isPlaceholderData={isPlaceholderData}
                    showSeeMore={false}
                    onSeeMore={() => {}}
                >
                    <GenericRankingTable
                        data={customers.slice(0, customerLimit)}
                        columns={customerColumns}
                    />
                </RankingCard>
            </div>
        </div>
    );
};
