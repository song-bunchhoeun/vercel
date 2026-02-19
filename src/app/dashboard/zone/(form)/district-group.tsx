'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Lock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { ZoneDistrict } from './zone.form.service';
import { useZoneExclusivity } from './useZoneExclusivity';

interface DistrictGroupProps {
    label: string;
    districts: ZoneDistrict[];
    field: {
        value: number[];
        onChange: (value: number[]) => void;
    };
    currentSelection?: number[];
    disabled?: boolean;
}

export const DistrictGroup = ({
    label,
    districts,
    field,
    disabled = false
}: DistrictGroupProps) => {
    const { applySelection, setInteractive, selectedIds, clearSelection } =
        useMapLayoutContext();
    const { isHadEither, isHadCustom, selectedDistrictId } =
        useZoneExclusivity();

    const isLocked = disabled || isHadEither;
    const [isOpen, setIsOpen] = useState(true);
    const isSyncingRef = useRef(false);

    // 1. Map Interactivity Logic
    useEffect(() => {
        /**
         * Requirement: Disable map selection/click if isHadCustom is true.
         * Also respects the general disabled prop.
         */
        setInteractive(!isHadCustom && !disabled);

        return () => setInteractive(false);
    }, [setInteractive, isHadCustom, disabled]);

    // 2. Sync: Form state → Map
    useEffect(() => {
        if (isSyncingRef.current || isLocked) return;

        isSyncingRef.current = true;
        clearSelection();

        if (Array.isArray(field.value) && field.value.length > 0) {
            applySelection(field.value.map(Number));
        }

        requestAnimationFrame(() => {
            isSyncingRef.current = false;
        });
    }, [field.value, applySelection, clearSelection, isLocked]);

    // 3. Sync: Map selection → Form
    useEffect(() => {
        // Guard: If custom polygon is active, block map-to-form sync entirely
        if (!Array.isArray(selectedIds) || isSyncingRef.current || isHadCustom)
            return;

        const selectedNumbers = selectedIds.map(Number);
        const currentFieldValues = field.value || [];
        const currentActiveId = selectedDistrictId?.[0];

        if (isLocked) {
            // Allow deselection on map even if locked
            if (selectedNumbers.length === 0 && currentFieldValues.length > 0) {
                isSyncingRef.current = true;
                field.onChange([]);
                requestAnimationFrame(() => {
                    isSyncingRef.current = false;
                });
                return;
            }

            // Sync check to prevent infinite loop
            const isMapSynced =
                selectedNumbers.length === 1 &&
                selectedNumbers[0] === currentActiveId;
            if (!isMapSynced && currentActiveId) {
                isSyncingRef.current = true;
                clearSelection();
                applySelection([currentActiveId]);
                requestAnimationFrame(() => {
                    isSyncingRef.current = false;
                });
            }
            return;
        }

        // Standard Selection (Not locked)
        const isChanged =
            selectedNumbers.length !== currentFieldValues.length ||
            selectedNumbers.some((id) => !currentFieldValues.includes(id));

        if (isChanged) {
            isSyncingRef.current = true;
            const newValue =
                selectedNumbers.length > 0
                    ? [selectedNumbers[selectedNumbers.length - 1]]
                    : [];
            field.onChange(newValue);
            requestAnimationFrame(() => {
                isSyncingRef.current = false;
            });
        }
    }, [
        selectedIds,
        field,
        isLocked,
        isHadCustom,
        selectedDistrictId,
        applySelection,
        clearSelection
    ]);

    const handleToggle = useCallback(
        (id: number, checked: boolean) => {
            const newValue = checked ? [id] : [];
            field.onChange(newValue);
            applySelection(newValue.map(Number));
        },
        [field, applySelection]
    );

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn(
                'flex flex-col gap-2 w-full',
                isLocked && 'opacity-80'
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h4 className="text-base font-medium gap-1.5 flex items-center">
                        {label}
                        <Badge className="bg-bg-primary-light text-primary rounded-full font-normal">
                            {districts.length}
                        </Badge>
                    </h4>
                    {isHadCustom && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Polygon Active
                        </span>
                    )}
                </div>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 cursor-pointer"
                    >
                        <ChevronDown
                            className={cn(
                                'transition-transform',
                                !isOpen && '-rotate-90'
                            )}
                        />
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="grid grid-cols-4 xl:grid-cols-12 lg:grid-cols-8 gap-2 bg-bg-secondary p-4 rounded-md">
                {districts.map((item) => {
                    const isChecked = field.value?.includes(item.id);
                    return (
                        <label
                            key={item.id}
                            className={cn(
                                'col-span-4 flex items-center gap-2 text-sm rounded-md px-3 py-1.5 transition-colors select-none',
                                isLocked && !isChecked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-bg-tertiary'
                            )}
                        >
                            <Checkbox
                                disabled={isLocked && !isChecked}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    handleToggle(item.id, Boolean(checked))
                                }
                                className="bg-white border data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-none"
                            />
                            <span className="truncate">{item.name}</span>
                        </label>
                    );
                })}
            </CollapsibleContent>
        </Collapsible>
    );
};
