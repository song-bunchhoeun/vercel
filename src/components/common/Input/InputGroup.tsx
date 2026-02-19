import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import React from 'react';

export interface InputGroupProps {
    placeholder: string;
    className?: string;
    icon?: React.ReactNode;
    clearIcon?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BaseInputGroup({
    placeholder,
    icon,
    clearIcon = false,
    className,
    value,
    onChange,
    ...props
}: InputGroupProps) {
    const hasContent = value.length > 0;

    const handleClear = () => {
        onChange({
            target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <InputGroup
            {...props}
            className={cn(
                className,
                'p-[8px_10px] border-mdisabled hover:border-hover has-[[data-slot=input-group-control]:focus-visible]:border-hover has-[[data-slot=input-group-control]:focus-visible]:ring-0'
            )}
        >
            <InputGroupAddon className="p-0">{icon}</InputGroupAddon>

            <InputGroupInput
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="placeholder:text-mtertiary"
            />
            {clearIcon && (
                <InputGroupAddon
                    align="inline-end"
                    className={`
                      transition-all duration-300
                      ${
                          hasContent
                              ? 'group-focus-within:visible group-focus-within:opacity-100 cursor-pointer'
                              : 'w-0 opacity-0 invisible overflow-hidden m-0 p-0'
                      }
                      ${!hasContent ? 'pointer-events-none' : ''}
                  `}
                    onClick={handleClear}
                >
                    &times;
                </InputGroupAddon>
            )}
        </InputGroup>
    );
}
