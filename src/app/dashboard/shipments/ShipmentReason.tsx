'use client';

import { BaseViewDialog } from '@/components/BaseForm/BaseViewDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ShipmentFailedReasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => void;
}

const failureReasons = [
    {
        key: 'driver_delayed',
        label: 'Driver delayed pickup without informing.'
    },
    { key: 'forgot_update', label: 'Driver forgot to update task status.' },
    {
        key: 'duplicate_order',
        label: 'Duplicate order mistakenly created by the retailer.'
    },
    {
        key: 'reschedule_request',
        label: 'Customer requested a reschedule or change of delivery time.'
    },
    {
        key: 'change_mind',
        label: 'Customer changed their mind about the purchase at the last minute.'
    },
    { key: 'unreachable', label: 'Customer unreachable.' },
    { key: 'other', label: 'Other' }
];

export default function ShipmentFailedReasonDialog({
    open,
    onOpenChange,
    onSubmit
}: ShipmentFailedReasonDialogProps) {
    const { t } = useTranslation();
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReasonText, setOtherReasonText] = useState('');

    // ✅ Reset local state when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedReason('');
            setOtherReasonText('');
        }
    }, [open]);

    const handleSubmit = () => {
        if (!selectedReason) return;

        // Validation for 'Other' option
        if (selectedReason === 'other' && !otherReasonText.trim()) return;

        const finalReason =
            selectedReason === 'other'
                ? otherReasonText.trim()
                : t(`shipments.failure_reason.reasons.${selectedReason}`);

        onSubmit(finalReason);
        onOpenChange(false);
    };

    const dialogContent = {
        title: t('shipments.failure_reason.title'),
        actions: (
            <div className="flex gap-2 justify-end w-full">
                <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onOpenChange(false)}
                >
                    {t('shipments.failure_reason.cancel')}
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="cursor-pointer"
                    disabled={
                        !selectedReason ||
                        (selectedReason === 'other' && !otherReasonText.trim())
                    }
                >
                    {t('shipments.failure_reason.submit')}
                </Button>
            </div>
        )
    };

    return (
        <BaseViewDialog
            isOpen={open}
            onOpenChange={onOpenChange}
            dialogContent={dialogContent}
            dialogMaxWidth="sm:max-w-[500px]"
            actionSeperator={false}
        >
            <RadioGroup
                value={selectedReason}
                onValueChange={(value) => {
                    setSelectedReason(value);
                    if (value !== 'other') setOtherReasonText('');
                }}
                className="gap-0"
            >
                {failureReasons.map((reason) => (
                    <div
                        key={reason.key}
                        className={cn(
                            'flex items-start space-x-3 p-2 rounded-lg transition-colors',
                            selectedReason === reason.key
                                ? 'bg-neutral-50'
                                : 'hover:bg-neutral-50/50'
                        )}
                    >
                        <RadioGroupItem
                            value={reason.key}
                            id={reason.key}
                            className="mt-1 border-neutral-300 text-primary focus:ring-primary"
                        />

                        <Label
                            htmlFor={reason.key}
                            className="flex-1 cursor-pointer text-sm font-medium leading-relaxed"
                        >
                            {t(
                                `shipments.failure_reason.reasons.${reason.key}`
                            )}
                        </Label>
                    </div>
                ))}
            </RadioGroup>

            {/* Conditional Input for 'Other' reason */}
            {selectedReason === 'other' && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Textarea
                        placeholder={t(
                            'shipments.failure_reason.other_placeholder'
                        )}
                        value={otherReasonText}
                        onChange={(e) => setOtherReasonText(e.target.value)}
                        className="w-full focus-visible:ring-primary border-neutral-200"
                        autoFocus
                    />
                </div>
            )}
        </BaseViewDialog>
    );
}
