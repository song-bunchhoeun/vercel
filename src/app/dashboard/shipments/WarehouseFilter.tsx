'use client';

import { UserResponseData } from '@/app/dashboard/user/(form)/user.form.service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWarehouses } from '@/hooks/useWarehouses';
import { cn } from '@/lib/utils';
import { WarehouseStatus } from '@/models/status';
import { ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function WarehouseFilter({
    profile
}: {
    profile: UserResponseData | undefined;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { data: warehouseData } = useWarehouses({
        top: 9999,
        page: 1,
        status: String(WarehouseStatus.Active)
    });

    const warehouses = useMemo(
        () => warehouseData?.value || [],
        [warehouseData]
    );

    const { watch, setValue } = useFormContext();
    const watchedValue = watch('warehouseIds');

    const selectedWarehouses = useMemo(() => {
        return watchedValue || [];
    }, [watchedValue]);

    const warehouseDisplayText = useMemo(() => {
        if (selectedWarehouses.length === 0) {
            return t('dashboard.overview.filters.all_warehouses');
        }

        const selectedNames = warehouses
            .filter((wh) => selectedWarehouses.includes(wh.id))
            .map((wh) => wh.name);

        if (selectedNames.length === 0) {
            return t('dashboard.overview.filters.all_warehouses');
        }

        if (selectedNames.length <= 2) {
            return selectedNames.join(', ');
        }

        const firstTwo = selectedNames.slice(0, 2).join(', ');
        const remaining = selectedNames.length - 2;
        return `${firstTwo} +${remaining}`;
    }, [selectedWarehouses, warehouses, t]);

    const handleWarehouseToggle = (warehouseId: string) => {
        const isSelected = selectedWarehouses.includes(warehouseId);
        if (!isSelected && selectedWarehouses.length >= 20) return;

        const newValue = isSelected
            ? selectedWarehouses.filter((id: string) => id !== warehouseId)
            : [...selectedWarehouses, warehouseId];
        setValue('warehouseIds', newValue);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    type="button"
                    className="h-9.5 justify-start border cursor-pointer text-neutral-600 bg-white hover:bg-accent hover:text-hover"
                    disabled={profile && !profile.isAdmin}
                    aria-label={t(
                        'dashboard.overview.filters.select_warehouses'
                    )}
                >
                    <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-gray">
                            {t('dashboard.overview.filters.warehouse_label')}
                        </span>
                        <Separator
                            orientation="vertical"
                            className="min-h-5 text-gray"
                            aria-hidden="true"
                        />
                        <span className="text-sm truncate flex-1 text-left">
                            {warehouseDisplayText}
                        </span>
                    </div>
                    <ChevronDown
                        size={14}
                        className="text-muted-foreground ml-2"
                        aria-hidden="true"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 z-1100" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                    <span className="font-semibold text-sm">
                        {t('dashboard.overview.filters.select_warehouses')}
                    </span>
                    {selectedWarehouses.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue('warehouseIds', [])}
                            className="h-auto p-1 text-xs cursor-pointer"
                        >
                            <X size={14} className="mr-1" />
                            {t('dashboard.overview.filters.clear')}
                        </Button>
                    )}
                </div>
                <ScrollArea className="max-h-75 overflow-y-auto">
                    <div className="p-2">
                        <div
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                            onClick={() => setValue('warehouseIds', [])}
                        >
                            <Checkbox
                                checked={selectedWarehouses.length === 0}
                                onCheckedChange={() =>
                                    setValue('warehouseIds', [])
                                }
                            />
                            <label className="text-sm cursor-pointer flex-1 font-medium">
                                {t('dashboard.overview.filters.select_all')}
                            </label>
                        </div>
                        {warehouses.map((warehouse) => {
                            const isSelected = selectedWarehouses.includes(
                                warehouse.id
                            );
                            const isDisabled =
                                selectedWarehouses.length >= 20 && !isSelected;

                            return (
                                <div
                                    key={warehouse.id}
                                    className={cn(
                                        'flex items-center space-x-2 p-2 rounded cursor-pointer',
                                        isDisabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-accent'
                                    )}
                                    onClick={() =>
                                        !isDisabled &&
                                        handleWarehouseToggle(warehouse.id)
                                    }
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onCheckedChange={() =>
                                            handleWarehouseToggle(warehouse.id)
                                        }
                                    />
                                    <label
                                        className={cn(
                                            'text-sm flex-1',
                                            !isDisabled && 'cursor-pointer'
                                        )}
                                    >
                                        {warehouse.name}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
