'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function TaskTypeMultiSelect({
    options,
    value,
    onChange
}: {
    //eslint-disable-next-line
    options: any[];
    value: number[];
    onChange: (v: number[]) => void;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="flex items-center justify-between gap-2 min-h-10 rounded-xl border border-neutral-200 px-3 py-1.5 bg-white cursor-pointer hover:border-neutral-300 transition-all">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-gray text-[10px] font-bold uppercase tracking-widest shrink-0">
                            Task Type
                        </span>
                        <span className="text-neutral-200">|</span>
                        <div className="flex flex-wrap gap-1">
                            {value.map((v) => (
                                <Badge
                                    key={v}
                                    variant="secondary"
                                    className="bg-accent/40 text-primary border-none text-[10px] font-bold"
                                >
                                    {options.find((o) => o.value === v)?.label}
                                    <X
                                        className="ml-1 h-3 w-3 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(
                                                value.filter((x) => x !== v)
                                            );
                                        }}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <ChevronDown
                        className={cn(
                            'w-4 h-4 text-neutral-400 transition-transform',
                            open && 'rotate-180'
                        )}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[200px] p-0 rounded-xl shadow-2xl border-neutral-100 z-[10005]"
            >
                <Command>
                    <CommandList>
                        <CommandGroup className="p-1">
                            {options.map((o) => (
                                <CommandItem
                                    key={o.value}
                                    onSelect={() =>
                                        onChange(
                                            value.includes(o.value)
                                                ? value.filter(
                                                      (x) => x !== o.value
                                                  )
                                                : [...value, o.value]
                                        )
                                    }
                                    className="rounded-lg"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4 text-primary',
                                            value.includes(o.value)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    <span className="font-medium text-sm">
                                        {o.label}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
