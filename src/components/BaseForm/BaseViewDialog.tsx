import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ReactNode } from 'react';
import { Badge } from '../ui/badge';

export interface BaseViewDetailsDialogContent {
    title?: string;
    text?: string;
    description?: string;
    actions?: ReactNode;
}

interface BaseDialogViewDetailsProps {
    children?: ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    dialogContent?: BaseViewDetailsDialogContent;
    dialogMaxWidth?: string;
    className?: string;
    overlayClassName?: string;
    actionSeperator?: boolean;
}

export function BaseViewDialog({
    children,
    isOpen,
    onOpenChange,
    dialogContent,
    dialogMaxWidth,
    className,
    overlayClassName,
    actionSeperator = true
}: BaseDialogViewDetailsProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={`flex flex-col w-[95%] ${className} ${dialogMaxWidth ? dialogMaxWidth : 'sm:max-w-[525px]'} ${dialogContent?.text === 'Scan' ? 'md:max-w-[525px]' : 'md:max-w-[649px]'} p-4`}
                overlayClassName={overlayClassName}
            >
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        {dialogContent?.title}{' '}
                        {dialogContent?.text && (
                            <Badge
                                variant="outline"
                                className="text-primary bg-primary/10"
                            >
                                {dialogContent?.text}
                            </Badge>
                        )}
                    </DialogTitle>
                    {dialogContent?.description && (
                        <DialogDescription>
                            {dialogContent?.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex flex-col w-full bg-white p-4 rounded-2xl space-y-4">
                    {children}
                    {actionSeperator && <Separator />}
                    <DialogFooter>{dialogContent?.actions}</DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
