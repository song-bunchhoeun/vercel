import { useTranslation } from 'react-i18next';

interface TooltipItem {
    dataKey: 'delivered' | 'failed';
    value: number;
    payload: {
        zone: string;
        delivered: number;
        failed: number;
    };
}

interface RechartsTooltipProps {
    active?: boolean;
    payload?: TooltipItem[];
}

export function OrderStatusTooltip({ active, payload }: RechartsTooltipProps) {
    const { t } = useTranslation();

    if (!active || !payload?.length) return null;

    const delivered =
        payload.find((p) => p.dataKey === 'delivered')?.value ?? 0;

    const failed = payload.find((p) => p.dataKey === 'failed')?.value ?? 0;

    return (
        <div className="rounded-xl bg-white shadow-lg pl-4 pr-10 py-3 text-sm">
            <p className="font-semibold mb-1">
                {t(
                    'dashboard.overview.business_insights.order_by_zone.delivered_status'
                )}
            </p>

            <div className="space-y-1">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-mariner-300" />
                        <span>
                            {t(
                                'dashboard.overview.business_insights.order_by_zone.delivered'
                            )}
                        </span>
                        <span className="font-semibold">{delivered}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cinnabar-300" />
                        <span>
                            {t(
                                'dashboard.overview.business_insights.order_by_zone.failed'
                            )}
                        </span>
                        <span className="font-semibold">{failed}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
