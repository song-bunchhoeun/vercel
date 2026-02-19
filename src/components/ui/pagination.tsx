import * as React from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="pagination-item"
            className={cn('', className)}
            {...props}
        />
    );
}

type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'a'>;

function PaginationLink({
    className,
    isActive,
    size = 'icon',
    disabled,
    ...props
}: PaginationLinkProps) {
    return (
        <a
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={disabled}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    // If active, we use the 'outline' or 'secondary' variant
                    // If not, 'ghost' keeps it clean
                    variant: 'ghost',
                    size
                }),
                // Base Layout
                'h-9 w-9 flex items-center justify-center rounded-md transition-colors cursor-pointer',

                // standard Shadcn/Tailwind logic:
                isActive
                    ? 'bg-accent text-accent-foreground' // Standard active state
                    : 'hover:text-foreground hover:bg-accent/50', // Standard inactive state

                // Disabled State
                disabled && 'opacity-50 pointer-events-none cursor-default',

                className
            )}
            // Prevent clicks if disabled
            onClick={(e) => {
                if (disabled) e.preventDefault();
                props.onClick?.(e);
            }}
            {...props}
        />
    );
}

function PaginationPrevious({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
            {...props}
        >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:block">Previous</span>
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
            {...props}
        >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon className="size-4" />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
};
