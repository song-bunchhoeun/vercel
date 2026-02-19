'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusTooltip } from '@/app/dashboard/overview/_components/OrderStatusTooltip';
import {
    PayloadProps,
    useGetHeatmapData,
    useGetOrderByZone
} from '@/hooks/useDashboard';
import { useTranslation } from 'react-i18next';
import { InfoTooltip } from '@/app/dashboard/overview/_components/RankingTables';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import MapPanel from '@/components/MapLayout/MapPanel';
import HeatmapLayer from '@/app/dashboard/overview/_components/HeatmapLayer';

const BusinessInsights = ({ fromDate, toDate }: PayloadProps) => {
    const { t } = useTranslation();
    const { isReady } = useMapLayoutContext();

    const { data: orderData, isLoading: isOrderLoading } = useGetOrderByZone({
        fromDate,
        toDate
    });
    const series = orderData?.data.series ?? [];

    const hasData = series.some(
        (item) => item.delivered > 0 || item.failed > 0
    );

    // Heatmap
    const { data: heatmapData, isLoading: isHeatmapLoading } =
        useGetHeatmapData({ fromDate, toDate });
    const points: [number, number][] =
        heatmapData?.data?.map((item) => [item.lat, item.lng]) ?? [];
    const heatPoints = points.length > 0;

    return (
        <div className="space-y-3 mb-24">
            <h2 className="text-lg font-bold">
                {t('dashboard.overview.business_insights.title')}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Order QTY by Zone */}
                <Card className="gap-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            {t(
                                'dashboard.overview.business_insights.order_by_zone.title'
                            )}
                            <InfoTooltip
                                title={t(
                                    'dashboard.overview.business_insights.order_by_zone.tooltip_title'
                                )}
                                description={t(
                                    'dashboard.overview.business_insights.order_by_zone.tooltip_desc'
                                )}
                            />
                        </CardTitle>
                    </CardHeader>

                    {/* Loading */}
                    {isOrderLoading && (
                        <div className="h-[320px] flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                                {t('dashboard.overview.rankings.loading')}
                            </span>
                        </div>
                    )}

                    {/* No data (undefined, empty, or all zero) */}
                    {!isOrderLoading && !hasData && (
                        <div className="h-[320px] flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                                {t(
                                    'dashboard.overview.business_insights.no_data'
                                )}
                            </span>
                        </div>
                    )}

                    {/* Chart */}
                    {!isOrderLoading && hasData && (
                        <div>
                            <div className="flex gap-4 text-[14px] text-neutral-600 px-6 mb-6 mt-2">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-mariner-300" />
                                    {t(
                                        'dashboard.overview.business_insights.order_by_zone.delivered'
                                    )}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-cinnabar-300" />
                                    {t(
                                        'dashboard.overview.business_insights.order_by_zone.failed'
                                    )}
                                </span>
                            </div>

                            <CardContent className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={series}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="zone"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                            label={
                                                <text
                                                    transform="rotate(-90)"
                                                    x={-180}
                                                    y={10}
                                                    textAnchor="middle"
                                                    className="text-[12px] font-medium"
                                                >
                                                    {t(
                                                        'dashboard.overview.business_insights.order_by_zone.y_axis_label'
                                                    )}
                                                </text>
                                            }
                                        />
                                        <Tooltip
                                            cursor={false}
                                            content={<OrderStatusTooltip />}
                                        />
                                        <Bar
                                            dataKey="failed"
                                            stackId="orders"
                                            fill="#fca5a5"
                                            barSize={36}
                                        />
                                        <Bar
                                            dataKey="delivered"
                                            stackId="orders"
                                            fill="#93c5fd"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>

                            <p className="text-center text-[12px]">
                                {t(
                                    'dashboard.overview.business_insights.order_by_zone.x_axis_label'
                                )}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Map */}
                <Card className="gap-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            {t(
                                'dashboard.overview.business_insights.heatmap.title'
                            )}
                            <InfoTooltip
                                title={t(
                                    'dashboard.overview.business_insights.heatmap.tooltip_title'
                                )}
                                description={t(
                                    'dashboard.overview.business_insights.heatmap.tooltip_desc'
                                )}
                            />
                        </CardTitle>
                    </CardHeader>

                    {isHeatmapLoading && (
                        <div className="h-[320px] flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                                {t('dashboard.overview.rankings.loading')}
                            </span>
                        </div>
                    )}

                    {!isHeatmapLoading && !heatPoints && (
                        <div className="h-[320px] flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                                {t(
                                    'dashboard.overview.business_insights.no_data'
                                )}
                            </span>
                        </div>
                    )}

                    {/* Chart */}
                    {!isHeatmapLoading && heatPoints && (
                        <>
                            <div className="px-4 pt-2">
                                <div className="h-[380px] w-full rounded-md overflow-hidden bg-white">
                                    <MapPanel />
                                    {isReady && (
                                        <HeatmapLayer points={points} />
                                    )}
                                </div>
                            </div>

                            {isReady && <HeatmapLayer points={points} />}
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default BusinessInsights;
