'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ToggleButtonValue = string | number;

export interface ToggleButtonOption {
    value: ToggleButtonValue;
    label: string;
    icon?: React.ReactNode;
}

interface ToggleButtonGroupProps {
    options: ToggleButtonOption[];
    value: ToggleButtonValue | null;
    onChange: (value: ToggleButtonValue) => void;
    className?: string; // wrapper for the whole group
    itemClassName?: string; // wrapper for each item (icon + text)
    buttonClassName?: string; // extra classes for the Button
}

export function ToggleButtonGroup({
    options,
    value,
    onChange,
    className,
    itemClassName,
    buttonClassName
}: ToggleButtonGroupProps) {
    return (
        <div className={cn('flex gap-5', className)}>
            {options.map((opt) => {
                const isActive = value === opt.value;

                return (
                    <div
                        key={opt.value}
                        className={cn(
                            'flex flex-col items-center gap-1',
                            itemClassName
                        )}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            className={cn(
                                'border h-11 w-11 hover:bg-primary hover:text-white cursor-pointer',
                                isActive
                                    ? 'text-white bg-pressed border-transparent bg-primary'
                                    : 'border-micon-primary',
                                buttonClassName
                            )}
                            onClick={() => onChange(opt.value)}
                        >
                            {opt.icon}
                        </Button>
                        <span className="text-sm">{opt.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
