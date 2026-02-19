'use client';

import { cn } from '@/lib/utils';
import { t } from 'i18next';
import * as React from 'react';
import { IMaskInput, IMaskInputProps } from 'react-imask';

// 🚀 Omit 'mask' and 'scale' to avoid conflicts with our hardcoded settings
type AmountInputProps = Omit<
    IMaskInputProps<HTMLInputElement>,
    'mask' | 'scale'
> & {
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void;
};

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
    ({ onChange, placeholder, className, ...props }, ref) => {
        return (
            <IMaskInput
                {...props}
                //eslint-disable-next-line
                mask={Number as any}
                scale={2} // Decimal places
                thousandsSeparator=" "
                min={0}
                padFractionalZeros={true} // Optional: ensures .00 is shown
                normalizeZeros={true}
                radix="." // Decimal separator
                mapToRadix={[',']} // Maps comma to dot for localized numpads
                type="text"
                placeholder={placeholder || t('common.form.amount_placeholder')}
                onAccept={(val: string) => {
                    // Returns the unmasked numeric string (e.g., "1500.50")
                    onChange?.(val);
                }}
                className={cn(
                    `rounded-md text-sm border shadow-xs px-3 h-9 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`,
                    className
                )}
                ref={ref}
                autofix={true}
            />
        );
    }
);

AmountInput.displayName = 'AmountInput';

export default AmountInput;
