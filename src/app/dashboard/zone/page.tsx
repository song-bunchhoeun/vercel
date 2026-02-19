'use client';

import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import ListEmptyDataComponent from '@/components/ListPage/ListEmptyDataComponent';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { Button } from '@/components/ui/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from '@/components/ui/input-group';
import { useDeleteZone, useGetListZones } from '@/hooks/useZone';
import { CircleCheck, Loader2, Plus, SearchIcon, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ZoneResponse } from './(form)/zone.form.service';
import ZoneItem from './zone-item';

const ZoneMapPolygonPreview = dynamic(
    () => import('./zone-map-polygon-preview'),
    { ssr: false }
);

const ZoneList = () => {
    const { t } = useTranslation();

    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();
    const [searchText, setSearchText] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { applySelection, fitToSelection, setInteractive, setDrawnGeoJson } =
        useMapLayoutContext();

    const { mutate: deleteZone } = useDeleteZone();

    // 1. Fetching Data
    const { data, isPending } = useGetListZones({
        searchText,
        page: 1,
        top: 100
    });

    // 1. Keep your existing zones memo
    const zones = useMemo(() => data?.value || [], [data?.value]);
    // 2. Track the previous length to detect additions
    const [prevLength, setPrevLength] = useState(0);

    // 3. Updated selection logic
    const selectedZone = useMemo(() => {
        if (zones.length === 0) return null;

        // Logic: If the list grew, we force the first one (the new one)
        if (zones.length > prevLength && prevLength !== 0) {
            return zones[0];
        }

        // Otherwise, try to find the existing selection or fallback to first
        return zones.find((z) => z.id === selectedId) || zones[0];
    }, [zones, selectedId, prevLength]);

    // 4. Update the ID and the length tracker
    useEffect(() => {
        if (selectedZone) {
            if (selectedId !== selectedZone.id) {
                setSelectedId(selectedZone.id);
            }
            // Update length tracker after selection is applied
            if (zones.length !== prevLength) {
                setPrevLength(zones.length);
            }
        }
    }, [selectedZone, selectedId, zones.length, prevLength]);

    // 3. Map Synchronization Logic
    useEffect(() => {
        setInteractive(false);
        return () => setDrawnGeoJson([]); // Cleanup on unmount
    }, [setInteractive, setDrawnGeoJson]);

    useEffect(() => {
        if (selectedZone) {
            const districtIds = (selectedZone.districts || []).map(
                (d) => d.districtId!
            );

            applySelection(districtIds);
            setDrawnGeoJson(selectedZone.polygon || []);
            fitToSelection();
        }
    }, [selectedZone, applySelection, setDrawnGeoJson, fitToSelection]);

    // 4. Handlers
    const onSearchChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleRemoveZone = useCallback(
        (zone: ZoneResponse) => {
            setDialogContent({
                icon: (
                    <span className="bg-danger-I p-3 rounded-full">
                        <Trash2 className="text-cinnabar-500 w-6 h-6" />
                    </span>
                ),
                title: t('zones.list_page.delete_dialog.title', {
                    name: zone.name
                }),
                description: t('zones.list_page.delete_dialog.description'),
                actions: (
                    <div className="w-full flex justify-center gap-4">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteZone(zone.id, {
                                    onSuccess: () => {
                                        setDialogContent({
                                            icon: (
                                                <span className="bg-success-50 p-3 rounded-full">
                                                    <CircleCheck className="text-success-500 w-6 h-6" />
                                                </span>
                                            ),
                                            title: t(
                                                'zones.list_page.delete_dialog.success_title'
                                            ),
                                            description: t(
                                                'zones.list_page.delete_dialog.success_description'
                                            )
                                        });
                                        setTimeout(
                                            () => setOpenConfirm(false),
                                            2000
                                        );
                                    },
                                    // ✅ FIX 118:52 - Replaced 'any' with safe 'unknown' error handling
                                    onError: (err: unknown) => {
                                        const message =
                                            err instanceof Error
                                                ? err.message
                                                : t(
                                                      'zones.list_page.delete_dialog.error'
                                                  );
                                        toast.error(message);
                                        setOpenConfirm(false);
                                    }
                                });
                            }}
                        >
                            {t('zones.list_page.delete_dialog.confirm')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setOpenConfirm(false)}
                        >
                            {t('zones.list_page.delete_dialog.cancel')}
                        </Button>
                    </div>
                )
            });
            setOpenConfirm(true);
        },
        [deleteZone, t]
    );

    return (
        <>
            <ZoneMapPolygonPreview autoFit />

            <div className="w-full overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isPending && (
                    <div className="flex h-64 w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {!isPending && (
                    <div className="p-4 pb-0 flex flex-col">
                        {/* HEADER */}
                        <div className="p-4 bg-white rounded-xl border mb-2 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary">
                                    {t('zones.list_page.title')}
                                </h3>

                                {(zones.length > 0 || searchText) && (
                                    <Button asChild size="sm">
                                        <Link href="/dashboard/zone/create">
                                            <Plus className="w-4 h-4 mr-1" />
                                            {t('zones.list_page.create_btn')}
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            {(zones.length > 0 || searchText) && (
                                <InputGroup>
                                    <InputGroupInput
                                        placeholder={t(
                                            'zones.list_page.search_placeholder'
                                        )}
                                        value={searchText}
                                        onChange={onSearchChanged}
                                    />
                                    <InputGroupAddon>
                                        <SearchIcon className="w-4 h-4 text-gray-400" />
                                    </InputGroupAddon>
                                </InputGroup>
                            )}
                        </div>

                        {/* LIST */}
                        {zones.length > 0 && (
                            <div>
                                {zones.map((item) => (
                                    <ZoneItem
                                        key={item.id}
                                        zone={item}
                                        onRemoveClicked={() =>
                                            handleRemoveZone(item)
                                        }
                                        onSelectItemClicked={() =>
                                            setSelectedId(item.id)
                                        }
                                        isSelected={selectedId === item.id}
                                    />
                                ))}
                            </div>
                        )}

                        {/* SEARCH EMPTY */}
                        {zones.length === 0 && searchText && (
                            <div className="p-4 text-center text-gray-500">
                                {t('zones.list_page.no_found')}
                            </div>
                        )}
                    </div>
                )}

                {/* INITIAL EMPTY */}
                {!isPending && zones.length === 0 && !searchText && (
                    <ListEmptyDataComponent
                        image="/nodata/zone.svg"
                        title_no_data={t('zones.list_page.empty_state.title')}
                        subtitle_no_data={t(
                            'zones.list_page.empty_state.description'
                        )}
                        createHref="/dashboard/zone/create"
                        createLabel={t('zones.form.create_title')}
                    />
                )}
            </div>

            {dialogContent && (
                <BaseDialogConfirmation
                    open={openConfirm}
                    onOpenChange={setOpenConfirm}
                    dialogContent={dialogContent!}
                    overlayClassName="z-1001"
                    className="z-1001"
                />
            )}
        </>
    );
};

export default ZoneList;
