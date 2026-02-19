'use client';

import { cn } from '@/lib/utils';
import { t } from 'i18next';
import * as React from 'react';
import { IMaskInput, IMaskInputProps } from 'react-imask';

type PhoneInputProps = Omit<IMaskInputProps<HTMLInputElement>, 'mask'> & {
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ onChange, placeholder, className, ...props }, ref) => {
        return (
            <IMaskInput
                {...props}
                // eslint-disable-next-line
                mask={'000 000 000[0]' as any}
                unmask={true}
                type="text"
                placeholder={placeholder || t('common.form.phone_placeholder')}
                onAccept={(val: string) => {
                    onChange?.(val);
                }}
                className={cn(
                    `rounded-md text-sm border shadow-xs px-3 h-9 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`,
                    className
                )}
                ref={ref}
            />
        );
    }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
