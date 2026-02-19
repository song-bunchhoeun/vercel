'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { useDashboardSummaryCardList } from '@/hooks/useDashboard';
import { getFormattedDate } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Info, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface StatCardProps {
    title: string;
    subTitle?: string;
    value: string | React.ReactNode;
    description?: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    icon: React.ReactNode;
    tooltip?: string;
    isLoading?: boolean;
}

interface StatCardsProps {
    fromDate?: string;
    toDate?: string;
    warehouseIds?: string[] | null;
}

// --- Helper Functions ---
const getTrendData = (growth: unknown) => {
    if (
        growth &&
        typeof growth === 'object' &&
        'percentage' in growth &&
        'isUp' in growth
    ) {
        const _growth = growth as { percentage: number; isUp: boolean };
        return {
            value: `${_growth.percentage}%`,
            isUp: _growth.isUp
        };
    }
    return undefined;
};

// --- Constants ---
const STAT_SECTIONS = [
    {
        translationKey: 'order_qty',
        iconName: 'box-add.svg',
        dataKey: 'ordersByPeriod',
        hasTrend: true
    },
    {
        translationKey: 'new_customers',
        iconName: 'profile-2user.svg',
        dataKey: 'newCustomerByPeriod',
        hasTrend: true
    },
    {
        translationKey: 'all_orders',
        iconName: 'clipboard-text.svg',
        dataKey: 'allOrders',
        hasTrend: false
    },
    {
        translationKey: 'all_customers',
        iconName: 'people.svg',
        dataKey: 'allCustomers',
        hasTrend: false
    }
] as const;

const StatCardFooter = ({
    isLoading,
    trend,
    description
}: Pick<StatCardProps, 'isLoading' | 'trend' | 'description'>) => {
    const { t } = useTranslation();
    if (isLoading) return null;

    if (trend) {
        return (
            <div className="flex items-center justify-center gap-1">
                <div
                    className="flex items-center gap-0.5 border border-neutral-200 text-sm font-bold py-0.5 px-1.5 rounded-sm"
                    aria-label={t('dashboard.overview.stats.trend_aria', {
                        trend: trend.isUp
                            ? t('dashboard.overview.stats.increased')
                            : t('dashboard.overview.stats.decreased'),
                        value: trend.value
                    })}
                >
                    {trend.isUp ? (
                        <ArrowUpRight
                            className="h-3 w-3 text-success-600"
                            aria-hidden="true"
                        />
                    ) : (
                        <ArrowDownRight
                            className="h-3 w-3 text-destructive"
                            aria-hidden="true"
                        />
                    )}
                    {trend.value}
                </div>
                <span className="text-sm text-secondary-foreground">
                    {description}
                </span>
            </div>
        );
    }

    if (description) {
        return (
            <div className="flex items-center justify-center">
                <span className="text-sm text-secondary-foreground font-medium">
                    {description}
                </span>
            </div>
        );
    }

    return null;
};

// --- Sub-components ---
const StatCard = ({
    title,
    subTitle,
    value,
    description,
    trend,
    icon,
    tooltip,
    isLoading
}: StatCardProps) => {
    const { t } = useTranslation();
    return (
        <Card className="flex-1 min-w-60 pt-6 pb-4">
            <CardContent className="px-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'p-2 rounded-full flex items-center justify-center bg-accent text-primary'
                            )}
                            aria-hidden="true"
                        >
                            <span className="bg-secondary rounded-full p-2">
                                {icon}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-foreground leading-tight">
                                {title}
                            </span>
                            {subTitle && !isLoading && (
                                <span className="text-sm text-secondary-foreground">
                                    {subTitle}
                                </span>
                            )}
                        </div>
                    </div>
                    {tooltip && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        aria-label={t(
                                            'dashboard.overview.stats.info_aria',
                                            { title }
                                        )}
                                        className="focus:outline-none focus:ring-2 focus:ring-mariner-500 rounded"
                                    >
                                        <Info className="h-4 w-4 text-mariner-500" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="w-84 gap-1 p-3 flex flex-col text-xs">
                                    <p className="font-bold">{title}</p>
                                    <p className="font-normal">{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center py-2 h-[52px]">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-mariner-500" />
                    ) : (
                        <div
                            className="text-3xl font-bold"
                            aria-label={t(
                                'dashboard.overview.stats.value_aria',
                                {
                                    title,
                                    value
                                }
                            )}
                        >
                            {value}
                        </div>
                    )}
                </div>

                <StatCardFooter
                    isLoading={isLoading}
                    trend={trend}
                    description={description}
                />
            </CardContent>
        </Card>
    );
};

// --- Main Component ---
export const StatCards = ({
    fromDate,
    toDate,
    warehouseIds
}: StatCardsProps) => {
    const { t } = useTranslation();
    const { data: summaryData, isLoading } = useDashboardSummaryCardList({
        fromDate,
        toDate,
        warehouseIds
    });

    const stats = useMemo(() => {
        // Translation helpers inside useMemo to access 't'
        const getDateRangeLabel = (fromDate?: string, toDate?: string) => {
            if (fromDate && toDate) {
                return `${getFormattedDate(fromDate)} - ${getFormattedDate(toDate)}`;
            }
            return t('dashboard.overview.stats.selected_period');
        };

        const date = summaryData?.dateDescrption ?? '-';
        const comparisonLabel = t('dashboard.overview.stats.vs_period', {
            date
        });

        const dateRangeLabel = getDateRangeLabel(fromDate, toDate);
        console.log('dateRangeLabel', dateRangeLabel);

        return STAT_SECTIONS.map((section) => {
            const data = summaryData ? summaryData[section.dataKey] : null;
            const trendData =
                section.hasTrend && data?.growth
                    ? getTrendData(data.growth)
                    : undefined;

            return {
                title: t(`dashboard.overview.stats.${section.translationKey}`),
                tooltip: t(
                    `dashboard.overview.stats.${section.translationKey}_tooltip`
                ),
                iconName: section.iconName,
                hasTrend: section.hasTrend,
                isLoading,
                value: data?.value?.toLocaleString() || '-',
                subTitle: section.hasTrend
                    ? dateRangeLabel
                    : t('dashboard.overview.stats.all_time'),
                trend: trendData,
                description: section.hasTrend ? comparisonLabel : undefined
            };
        });
    }, [summaryData, isLoading, fromDate, toDate, t]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <StatCard
                    key={`${stat.title}-${index}`}
                    {...stat}
                    icon={
                        <Image
                            src={`/dashboard/${stat.iconName}`}
                            width={24}
                            height={24}
                            alt={stat.title}
                            className="h-6 w-6"
                        />
                    }
                />
            ))}
        </div>
    );
};
