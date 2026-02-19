'use client';

import { BaseViewDialog } from '@/components/BaseForm/BaseViewDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ShipmentFailedReasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => void;
}

const failureReasons = [
    'Driver delayed pickup without informing.',
    'Driver forgot to update task status.',
    'Duplicate order mistakenly created by the retailer.',
    'Customer requested a reschedule or change of delivery time.',
    'Customer changed their mind about the purchase at the last minute.',
    'Customer unreachable.',
    'Other'
];

export default function ShipmentFailedReasonDialog({
    open,
    onOpenChange,
    onSubmit
}: ShipmentFailedReasonDialogProps) {
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
        if (selectedReason === 'Other' && !otherReasonText.trim()) return;

        const finalReason =
            selectedReason === 'Other'
                ? otherReasonText.trim()
                : selectedReason;

        onSubmit(finalReason);
        onOpenChange(false);
    };

    const dialogContent = {
        title: 'Failure Reason',
        actions: (
            <div className="flex gap-2 justify-end w-full">
                <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="cursor-pointer"
                    disabled={
                        !selectedReason ||
                        (selectedReason === 'Other' && !otherReasonText.trim())
                    }
                >
                    Submit
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
            className="z-1001"
            overlayClassName="z-1001"
        >
            <RadioGroup
                value={selectedReason}
                onValueChange={(value) => {
                    setSelectedReason(value);
                    if (value !== 'Other') setOtherReasonText('');
                }}
                className="gap-0"
            >
                {failureReasons.map((reason) => (
                    <div
                        key={reason}
                        className={cn(
                            'flex items-start space-x-3 p-2 rounded-lg transition-colors',
                            selectedReason === reason
                                ? 'bg-neutral-50'
                                : 'hover:bg-neutral-50/50'
                        )}
                    >
                        <RadioGroupItem
                            value={reason}
                            id={reason}
                            className="mt-1 border-neutral-300 text-primary focus:ring-primary"
                        />

                        <Label
                            htmlFor={reason}
                            className="flex-1 cursor-pointer text-sm font-medium leading-relaxed"
                        >
                            {reason}
                        </Label>
                    </div>
                ))}
            </RadioGroup>

            {/* Conditional Input for 'Other' reason */}
            {selectedReason === 'Other' && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Textarea
                        placeholder="Write text here..."
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
