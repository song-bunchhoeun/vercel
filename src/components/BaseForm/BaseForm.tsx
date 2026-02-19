'use client';

import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import {
    FieldErrors,
    FormProvider,
    useForm,
    ValidationMode
} from 'react-hook-form';
import { input, output, ZodType } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseFormProps<T extends ZodType<any, any>> {
    schema: T;
    defaultValues: input<T>;
    onValid?: (data: output<T>, event?: React.BaseSyntheticEvent) => void;
    onInValid?: (
        errors: FieldErrors<T>,
        event?: React.BaseSyntheticEvent
    ) => void;
    onChange?: (data: output<T>) => void;
    debounce?: number;
    children?: React.ReactNode;
    disabled?: boolean;
    defaultTrigger?: boolean;
    id?: string;
    mode?: keyof ValidationMode; // ✅ New Prop
    reValidateMode?: keyof Omit<ValidationMode, 'onTouched' | 'all'>; // ✅ New Prop
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BaseForm<T extends ZodType<any, any>>({
    schema,
    defaultValues,
    onValid,
    onInValid,
    onChange,
    debounce = 500,
    children,
    defaultTrigger = false,
    id,
    mode = 'onChange', // ✅ New Prop
    reValidateMode = 'onChange' // ✅ New Prop
}: BaseFormProps<T>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<input<T>, any, output<T>>({
        resolver: zodResolver(schema),
        defaultValues,
        mode,
        reValidateMode
    });

    const { watch, handleSubmit } = form;
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    /**
     * ✅ Debounce Handler — centralized function
     * Used by both: watch subscription + form submit
     */
    const debounceHandler = useCallback(
        (values?: output<T>) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                if (onChange && values) onChange(values);
                else if (onValid) handleSubmit(onValid, onInValid)();
            }, debounce);
        },
        [onChange, handleSubmit, onValid, onInValid, debounce]
    );

    /**
     * ✅ useEffect: subscribe to field changes ONLY if onChange exists
     */
    useEffect(() => {
        if (!onChange) return; // skip for manual form
        const subscription = watch((values) =>
            debounceHandler(values as output<T>)
        );
        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutRef.current);
        };
    }, [watch, onChange, debounceHandler]);

    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues);
            if (defaultTrigger) form.trigger();
        }
    }, [defaultValues, form, defaultTrigger]);

    /**
     * ✅ Unified submit handler that also respects debounce
     */
    const handleFormSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            debounceHandler(); // no values => calls handleSubmit path
        },
        [debounceHandler]
    );

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form
                    id={id}
                    method="POST"
                    onSubmit={handleFormSubmit}
                    className="space-y-6 flex-[1_1_auto]"
                >
                    {children}
                </form>
            </Form>
        </FormProvider>
    );
}
