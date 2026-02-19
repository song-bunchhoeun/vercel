'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SummaryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data?: {
        totalReceived: number;
        successCount: number;
        failureCount: number;
    } | null; // Allow null to match React state
}

interface StatCardProps {
    label: string;
    value: number;
    className?: string;
}

const StatCard = ({ label, value, className }: StatCardProps) => (
    <div
        className={cn(
            'flex-1 p-6 rounded-xl border border-neutral-200 bg-white flex flex-col items-start min-h-[140px] shadow-sm',
            className
        )}
    >
        <p className="text-gray text-sm font-medium mb-4">{label}</p>
        <p className="text-4xl font-bold text-primary mt-auto w-full text-center">
            {value}
        </p>
    </div>
);

export function BulkImportSummary({
    isOpen,
    onOpenChange,
    data
}: SummaryDialogProps) {
    const { t } = useTranslation();
    // ✅ Safety Gate: If data is null or undefined, don't render content.
    // This prevents "Cannot read properties of null" during component transitions.
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[700px] p-8 gap-0 border-none rounded-2xl shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="flex flex-row items-center justify-between mb-8 space-y-0">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-bold">
                            {t('shipments.bulk_summary.title')}
                        </DialogTitle>
                        <DialogDescription className="text-primary bg-accent px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            {t('shipments.bulk_summary.preview')}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <StatCard
                        label={t('shipments.bulk_summary.total')}
                        value={data.totalReceived ?? 0}
                    />
                    <StatCard
                        label={t('shipments.bulk_summary.success')}
                        value={data.successCount ?? 0}
                    />
                    <StatCard
                        label={t('shipments.bulk_summary.failed')}
                        value={data.failureCount ?? 0}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        className="cursor-pointer px-8 py-2 font-semibold transition-all hover:opacity-90 active:scale-95"
                        onClick={() => {
                            onOpenChange(false);
                            window.history.back();
                        }}
                    >
                        {t('shipments.bulk_summary.close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
