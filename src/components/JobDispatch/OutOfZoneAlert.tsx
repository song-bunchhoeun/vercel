'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutOfZoneAlertProps {
    count: number;
    onClose?: () => void;
}

export default function OutOfZoneAlert({
    count,
    onClose
}: OutOfZoneAlertProps) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-2 mt-4 mx-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 text-sm text-orange-800">
                <div className="bg-orange-100 p-1.5 rounded-lg">
                    <AlertTriangle size={18} className="text-orange-600" />
                </div>
                <div>
                    <span className="font-bold">{count} Out of Zone. </span>
                    <span className="text-orange-700/80 font-medium">
                        Adjust assignments to drivers within this service area.
                    </span>
                </div>
            </div>

            {onClose && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-400 hover:bg-orange-100 hover:text-orange-600 rounded-lg cursor-pointer"
                    onClick={onClose}
                >
                    <X size={16} strokeWidth={3} />
                </Button>
            )}
        </div>
    );
}
