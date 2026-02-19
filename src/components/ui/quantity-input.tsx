'use client';

import { cn } from '@/lib/utils';
import { t } from 'i18next';
import * as React from 'react';
import { IMaskInput, IMaskInputProps } from 'react-imask';

type QtyInputProps = Omit<
    IMaskInputProps<HTMLInputElement>,
    'mask' | 'scale' | 'radix'
> & {
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void;
};

const QtyInput = React.forwardRef<HTMLInputElement, QtyInputProps>(
    ({ onChange, placeholder, className, ...props }, ref) => {
        return (
            <IMaskInput
                {...props}
                // 🎯 Integer mask: No decimals allowed
                //eslint-disable-next-line
                mask={Number as any}
                scale={0}
                thousandsSeparator=" "
                min={1} // Parcel quantity usually starts at 1
                normalizeZeros={true}
                type="text"
                placeholder={placeholder || t('common.form.qty_placeholder')}
                onAccept={(val: string) => {
                    onChange?.(val);
                }}
                className={cn(
                    `rounded-md text-sm border shadow-xs px-3 h-9 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`,
                    className
                )}
                inputRef={ref}
            />
        );
    }
);

QtyInput.displayName = 'QtyInput';

export default QtyInput;
