import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface BaseDialogContentProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actions?: React.ReactNode;
}
export interface BaseDialogFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogContent: BaseDialogContentProps;
    className?: string;
    overlayClassName?: string;
}

export function BaseDialogConfirmation({
    open,
    onOpenChange,
    dialogContent,
    className,
    overlayClassName = 'z-50'
}: BaseDialogFormProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                {dialogContent?.actions && (
                    <DialogFooter className="mt-2 flex justify-center gap-3 w-full">
                        {dialogContent?.actions}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
