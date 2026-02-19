import React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';

export interface ToastProps {
    toastId: number | string;
    status: 'success' | 'failed' | 'attention';
    description: string;
}

const Toast: React.FC<ToastProps> = ({ toastId, status, description }) => {
    const STATUS = {
        success: {
            icon: (
                <div className="p-3 rounded-lg bg-green-50">
                    <CheckCircle2
                        className="w-6 h-6 text-green-500"
                        strokeWidth={1.5}
                    />
                </div>
            ),
            title: 'Success',
            border: 'border-green-500',
            text: 'text-green-500'
        },
        failed: {
            icon: (
                <div className="p-3 rounded-lg bg-red-50">
                    <XCircle
                        className="w-6 h-6 text-red-500"
                        strokeWidth={1.5}
                    />
                </div>
            ),
            title: 'Failed!',
            border: 'border-red-500',
            text: 'text-red-500'
        },
        attention: {
            icon: (
                <div className="p-3 rounded-lg bg-amber-50">
                    <AlertTriangle
                        className="w-6 h-6 text-amber-500"
                        strokeWidth={1.5}
                    />
                </div>
            ),
            title: 'Attention!',
            border: 'border-amber-500',
            text: 'text-amber-500'
        }
    }[status];

    return (
        <div
            className={cn(
                'inline-flex items-start p-4 rounded-2xl bg-white shadow-md border max-w-fit',
                STATUS.border
            )}
        >
            <div className="flex items-start gap-3">
                {STATUS.icon}

                <div className="flex flex-col">
                    <h1 className={cn('font-semibold text-base', STATUS.text)}>
                        {STATUS.title}
                    </h1>
                    <p className="text-sm text-neutral-700 whitespace-nowrap me-16">
                        {description}
                    </p>
                </div>
            </div>

            <button
                onClick={() => toast.dismiss(toastId)}
                className="ml-3 text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="Close Toast"
            >
                <X className={cn('w-5 h-5', STATUS.text)} />
            </button>
        </div>
    );
};

export default Toast;
