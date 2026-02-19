'use client';

import DateRangePicker from '@/components/common/Date/DatePickerRange';
import { getFormattedDate } from '@/lib/dayjs';
import { PlusIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useFormContext } from 'react-hook-form'; // ✅ Add this
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
    FormControl,
    FormControlGroup,
    FormField,
    FormItem,
    FormMessage
} from '../ui/form';
import { Input } from '../ui/input';

export interface TitleComponentProps {
    title: string;
    subtitle?: string;
    createHref?: string;
    createLabel?: string;
    isDisabled?: boolean;
    actionButton?: React.ReactNode;
    showCreateButton?: boolean;
    filterItem?: React.ReactNode;
    filterKey?: React.ReactNode;
    disableDate?: boolean;
    selectedDelete?: React.ReactNode;
    downloadButton?: React.ReactNode;
}

export function ListPageTitleComponent({
    title,
    subtitle,
    createHref,
    createLabel,
    actionButton,
    showCreateButton = true,
    filterItem,
    filterKey,
    disableDate = false,
    selectedDelete,
    downloadButton
}: TitleComponentProps) {
    const { t } = useTranslation();
    // ✅ Access RHF context
    const { setValue, watch } = useFormContext();

    // ✅ Initialize from RHF if available
    const formFromDate = watch('fromDate');
    const formToDate = watch('toDate');

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: formFromDate ? new Date(formFromDate) : undefined,
        to: formToDate ? new Date(formToDate) : undefined
    });

    // ✅ Update RHF values whenever user changes the date picker
    useEffect(() => {
        if (dateRange?.from) {
            setValue('fromDate', getFormattedDate(dateRange?.from), {
                shouldValidate: true
            });
        } else {
            setValue('fromDate', undefined);
        }

        if (dateRange?.to) {
            setValue('toDate', getFormattedDate(dateRange?.to), {
                shouldValidate: true
            });
        } else {
            setValue('toDate', undefined);
        }

        setValue('page', 1, { shouldValidate: true });
    }, [dateRange, setValue]);

    return (
        <div
            className={`flex flex-col gap-2.5 border bg-white rounded-lg p-4`}
            // ${showCreateButton ? 'flex-col' : 'justify-between'}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{title}</h1>
                    <p className="text-sm">{subtitle}</p>
                </div>
                <div className="flex gap-2">
                    {actionButton}
                    {downloadButton}
                    {showCreateButton && createHref && createLabel && (
                        <Button asChild className="text-white cursor-pointer">
                            <Link href={createHref}>
                                <PlusIcon size={40} strokeWidth={1} />
                                {''}
                                {createLabel}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end">
                <div className="flex gap-2 mr-auto">{filterItem}</div>
                <div className="flex gap-4 justify-end items-center">
                    {filterKey}
                    {/* 🔍 Search */}
                    <FormField
                        name="searchText"
                        rules={{
                            maxLength: {
                                value: 225,
                                message: t(
                                    'common.list_page.search_max_length',
                                    {
                                        count: 225
                                    }
                                )
                            }
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormControlGroup
                                    className="w-26 focus-within:w-[336px] transition-all duration-300 ease-in-out"
                                    leftAddon={
                                        <SearchIcon width={20} height={20} />
                                    }
                                >
                                    <Input
                                        maxLength={225}
                                        placeholder={t(
                                            'common.list_page.search'
                                        )}
                                        {...field}
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </FormControlGroup>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!disableDate && (
                        <>
                            {/* 📅 Date Range Picker */}
                            <DateRangePicker
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                showOutsideDays={false}
                            />

                            {/* 🫙 Hidden Inputs to store actual RHF values */}
                            <FormField
                                name="fromDate"
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input type="hidden" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="toDate"
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input type="hidden" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                    {selectedDelete}
                </div>
            </div>
        </div>
    );
}
