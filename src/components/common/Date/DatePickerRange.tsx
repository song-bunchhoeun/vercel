'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { getFormattedDate } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    dateRange: DateRange | undefined;
    setDateRange: (date: DateRange | undefined) => void;
    showOutsideDays: boolean;
}

export default function DateRangePicker({
    className,
    dateRange,
    setDateRange,
    showOutsideDays = true
}: DateRangePickerProps) {
    const { t } = useTranslation();
    return (
        <div className={cn('grid gap-2 rounded-lg', className)}>
            <Popover>
                <PopoverTrigger
                    asChild
                    className="hover:border-hover border-mdisabled bg-white hover:bg-white"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        id="date"
                        className="w-fit justify-start cursor-pointer border hover:text-foreground hover:bg-accent"
                    >
                        <div className="flex gap-2 items-center color text-gray">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{t('common.list_page.created_date')}</span>
                        </div>

                        <Separator orientation="vertical" />

                        {!dateRange?.from && !dateRange?.to && (
                            <span className="font-normal text-mtertiary">
                                {t('common.list_page.created_date_label')}
                            </span>
                        )}

                        {dateRange?.from && getFormattedDate(dateRange.from)}
                        {dateRange?.to && (
                            <> - {getFormattedDate(dateRange?.to)}</>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-1001" align="end">
                    <Calendar
                        autoFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        showOutsideDays={showOutsideDays}
                        timeZone={
                            process.env.NEXT_PUBLIC_LMD_TIMEZONE ??
                            'Asia/Phnom_Penh'
                        }
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
