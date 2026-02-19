'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { ReactNode } from 'react';

interface FormActionsProps {
    cancelText?: string;
    submitText?: string | ReactNode;
    onCancelClicked: () => void;
    disabled?: boolean;
    isPending?: boolean;
}

export default function FormActions({
    cancelText = 'Cancel',
    onCancelClicked,
    submitText = 'Submit',
    disabled = false,
    isPending = false
}: FormActionsProps) {
    // Both buttons should be disabled if manually set or if an action is pending
    const isInteractionDisabled = disabled || isPending;

    return (
        <div className="flex justify-between bg-white p-4 rounded-2xl mt-4 mb-4 border border-border">
            <Button
                disabled={isInteractionDisabled}
                variant="ghost"
                className="cursor-pointer border"
                type="button"
                onClick={onCancelClicked}
            >
                {cancelText}
            </Button>

            <Button
                disabled={isInteractionDisabled}
                type="submit"
                className="cursor-pointer min-w-[120px]"
            >
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    submitText
                )}
            </Button>
        </div>
    );
}
