'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
    Controller,
    FormProvider,
    useFormContext,
    useFormState,
    type ControllerProps,
    type FieldPath,
    type FieldValues
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

// ---------------------------
// Contexts and Utilities
// ---------------------------
type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
    props: ControllerProps<TFieldValues, TName>
) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
);

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = useFormContext();
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState
    };
};

// ---------------------------
// Form Components
// ---------------------------
function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
    const id = React.useId();
    return (
        <FormItemContext.Provider value={{ id }}>
            <div
                data-slot="form-item"
                className={cn('grid gap-2', className)}
                {...props}
            />
        </FormItemContext.Provider>
    );
}

function FormLabel({
    className,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
    const { error, formItemId } = useFormField();
    return (
        <Label
            data-slot="form-label"
            data-error={!!error}
            className={cn('data-[error=true]:text-destructive', className)}
            htmlFor={formItemId}
            {...props}
        />
    );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
    const { error, formItemId, formDescriptionId, formMessageId } =
        useFormField();
    return (
        <Slot
            data-slot="form-control"
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
}

// ✅ NEW: FormControlGroup — handles addons around FormControl
interface FormControlGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
    children: React.ReactNode;
}

const FormControlGroup = React.forwardRef<
    HTMLDivElement,
    FormControlGroupProps
>(({ leftAddon, rightAddon, children, className, ...props }, ref) => {
    const { error } = useFormField();
    return (
        <div
            ref={ref}
            data-slot="form-control-group"
            aria-invalid={!!error} // ✅ important for aria-invalid utilities
            className={cn(
                'flex items-stretch rounded-md border border-input bg-transparent min-w-0 transition-[color,box-shadow] shadow-xs outline-none',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                error && 'border-destructive focus-within:ring-destructive',
                className
            )}
            {...props}
        >
            {leftAddon && (
                <div className="flex items-center justify-center pl-3 text-muted-foreground">
                    {leftAddon}
                </div>
            )}
            <FormControl className="flex-1">{children}</FormControl>
            {rightAddon && (
                <div className="flex items-center justify-center pr-3 text-muted-foreground cursor-pointer">
                    {rightAddon}
                </div>
            )}
        </div>
    );
});
FormControlGroup.displayName = 'FormControlGroup';

// ---------------------------
// Description & Message
// ---------------------------
function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
    const { formDescriptionId } = useFormField();
    return (
        <p
            data-slot="form-description"
            id={formDescriptionId}
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? '') : props.children;
    if (!body) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            id={formMessageId}
            className={cn('text-destructive text-sm mb-4', className)}
            {...props}
        >
            {body}
        </p>
    );
}

// ---------------------------
// Exports
// ---------------------------
export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormControlGroup, // ✅ added here
    FormDescription,
    FormMessage,
    FormField
};
