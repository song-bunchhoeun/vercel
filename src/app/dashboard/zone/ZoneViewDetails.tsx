import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import { Badge } from '@/components/ui/badge';
import BaseMap from '@/components/ui/base-map';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetProvincesDistrict } from '@/hooks/useMap';
import { useGetZoneDetail } from '@/hooks/useZone';
import type { MapOptions } from 'leaflet';
import { LucideTrash2, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ZoneDistrict, ZoneResponse } from './(form)/zone.form.service';
import { getFormattedDate } from '@/lib/dayjs';

interface ZoneViewDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedId: string;
    onZoneDeleted?: (zone: ZoneResponse) => void;
}

export default function ZoneViewDetails({
    open,
    onOpenChange,
    selectedId,
    onZoneDeleted
}: ZoneViewDetailsProps) {
    const [zone, setZone] = useState<ZoneResponse | undefined>(undefined);
    const { data, isLoading } = useGetZoneDetail(selectedId);
    const { data: provincesDistrictData } = useGetProvincesDistrict();

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsNavigating(false);
        }
    }, [open]);

    useEffect(() => {
        if (data) {
            setZone(data);
        }
    }, [data]);

    const mapOptions: MapOptions = useMemo(
        () => ({
            zoom: 12,
            minZoom: 11,
            maxZoom: 16,
            maxBoundsViscosity: 1.0
        }),
        []
    );

    const dialogContent: BaseViewDetailsDialogContent = {
        title: 'Zone',
        text: 'View',
        actions: (
            <div className="flex justify-between w-full">
                <div className="flex h-5 justify-center items-center">
                    <Button
                        variant="ghost"
                        onClick={() => zone && onZoneDeleted!(zone)}
                        className="cursor-pointer"
                        disabled={isNavigating}
                    >
                        <LucideTrash2 className="text-danger" />
                    </Button>
                    <Separator orientation="vertical" className="h-full" />
                    <Button
                        variant="ghost"
                        className="cursor-pointer"
                        disabled={isNavigating}
                    >
                        <Link
                            onClick={(e) => e.stopPropagation()}
                            href={`/dashboard/zone/edit/${zone?.id}`}
                        >
                            <SquarePen className="text-primary" />
                        </Link>
                    </Button>
                </div>
                <Button
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer text-sm px-3 sm:px-4"
                >
                    Close
                </Button>
            </div>
        )
    };

    const getSelectedDistricts = (provinceId: number) => {
        if (!zone?.districts || !provincesDistrictData?.value) return [];

        const province = provincesDistrictData.value.find(
            (p) => p.id === provinceId
        );
        if (!province?.districts) return [];

        return province.districts.filter((d: ZoneDistrict) =>
            zone.districts!.some((z) => z.id === d.id)
        );
    };

    return (
        <>
            <BaseViewDialog
                isOpen={open}
                onOpenChange={onOpenChange}
                dialogContent={dialogContent}
                dialogMaxWidth="sm:max-w-[840px]"
                className="z-1001"
                overlayClassName="z-1001"
            >
                {isLoading || !zone ? (
                    <span>Loading...</span>
                ) : (
                    <div className="grid grid-cols-2">
                        <div className="grid grid-cols-1 gap-y-4">
                            <div>
                                <p className="text-gray text-xs font-sans">
                                    Zone Name
                                </p>
                                <p className="text-sm font-medium">
                                    {zone?.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray text-xs font-sans">
                                    Zone Created Date
                                </p>
                                <p className="text-sm font-medium">
                                    {getFormattedDate(zone.dateCreate)}
                                </p>
                            </div>
                            {provincesDistrictData?.value.map((province) => {
                                const selectedDistricts = getSelectedDistricts(
                                    province.id
                                );
                                if (!selectedDistricts.length) return null;

                                return (
                                    <div
                                        key={province.id}
                                        className="flex flex-col gap-2"
                                    >
                                        <h4 className="text-sm text-gray w-full gap-1.5 flex">
                                            {province.name}
                                            <Badge className="bg-bg-primary-light text-primary rounded-full">
                                                {selectedDistricts.length}
                                            </Badge>
                                        </h4>
                                        <div className="flex flex-wrap gap-2 text-gray2 font-medium">
                                            {selectedDistricts.map(
                                                (district: ZoneDistrict) => (
                                                    <span
                                                        key={district.id}
                                                        className="text-sm font-normal cursor-pointer rounded-sm px-2 py-1 border border-border-brand whitespace-nowrap"
                                                    >
                                                        {district.districtName}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <BaseMap
                                options={mapOptions}
                                className="h-full rounded-none"
                            />
                        </div>
                    </div>
                )}
            </BaseViewDialog>
        </>
    );
}
