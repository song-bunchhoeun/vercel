'use client';

import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { BaseDialogContentProps } from '../BaseForm/BaseDialogConfirmation';
import { Dispatch, SetStateAction, useState } from 'react';
import { Label } from '../ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { UseMutateFunction } from '@tanstack/react-query';
import Toast from '../common/toast/Toast';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

type ApiError = {
    message?: string;
};

interface ActiveStatusToggleProps {
    isActive: boolean;
    setIsActive: Dispatch<SetStateAction<boolean>>;
    activeContent: BaseDialogContentProps;
    deactiveContent: BaseDialogContentProps;
    successContent: BaseDialogContentProps;

    mutate: UseMutateFunction<
        unknown,
        AxiosError<ApiError> | Error,
        number,
        unknown
    >;
    isPending: boolean;

    className?: string;
    overlayClassName?: string;
}

const ActiveStatusToggle = ({
    isActive,
    setIsActive,
    activeContent,
    deactiveContent,
    successContent,
    mutate,
    isPending,
    className,
    overlayClassName
}: ActiveStatusToggleProps) => {
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    const [open, setOpen] = useState(false);
    const [hideButton, setHideButton] = useState(false);

    const onCheckedChanged = (checked: boolean) => {
        setDialogContent(checked ? activeContent : deactiveContent);
        setOpen(true);
    };

    const handleConfirm = () => {
        const nextStatus = isActive ? 0 : 1;

        mutate(nextStatus, {
            onSuccess: () => {
                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="success"
                        description="Status updated successfully."
                    />
                ));

                setIsActive((prev) => !prev);
                setHideButton(true);
                setDialogContent(successContent);

                // Optional: auto close after success
                // setTimeout(() => setOpen(false), 800);
            },
            onError: (err) => {
                setHideButton(false);

                const axiosErr = err as AxiosError<ApiError>;
                const message =
                    axiosErr?.response?.data?.message ??
                    (err as Error)?.message ??
                    'Failed to update status. Please try again.';

                toast.custom((toastId) => (
                    <Toast
                        toastId={toastId}
                        status="failed"
                        description={message}
                    />
                ));
            }
        });
    };

    const handleCloseDialog = (open: boolean) => {
        setOpen(open);

        if (!open) {
            setTimeout(() => {
                setHideButton(false);
            }, 200);
        }
    };

    return (
        <>
            <Label>
                Activate
                <Switch
                    id="status"
                    checked={isActive}
                    className={cn(
                        'data-[state=checked]:bg-(--success-600) data-[state=unchecked]:bg-(--neutral-200)',
                        'transition-colors cursor-pointer'
                    )}
                    onCheckedChange={onCheckedChanged}
                />
            </Label>

            <Dialog open={open} onOpenChange={handleCloseDialog}>
                <DialogContent
                    className={cn(
                        'w-[95%] max-w-136 p-6 text-center [&>button.absolute]:hidden flex flex-col',
                        className
                    )}
                    overlayClassName={overlayClassName}
                >
                    <DialogHeader className="flex flex-col items-center justify-center mt-4 w-full">
                        {dialogContent?.icon}
                        <DialogTitle className="text-lg font-semibold">
                            {dialogContent?.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm max-w-95 text-center mb-4">
                            {dialogContent?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        {!hideButton && (
                            <div className="mt-2 flex justify-center gap-3 w-full">
                                <Button
                                    className="cursor-pointer border"
                                    onClick={handleConfirm}
                                    variant="ghost"
                                    disabled={isPending}
                                >
                                    {isPending
                                        ? 'Updating...'
                                        : "Yes, I'm sure"}
                                </Button>

                                <Button
                                    className="cursor-pointer"
                                    onClick={() => setOpen(false)}
                                    variant="warning"
                                    disabled={isPending}
                                >
                                    No, Cancel it
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ActiveStatusToggle;
