import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ZoneResponse } from './(form)/zone.form.service';

interface ZoneItemProps {
    zone: ZoneResponse;
    onRemoveClicked: () => void;
    isSelected: boolean;
    onSelectItemClicked: () => void;
}

const ZoneItem = ({
    zone,
    onRemoveClicked,
    isSelected,
    onSelectItemClicked
}: ZoneItemProps) => {
    const { t } = useTranslation();
    return (
        <div className="rounded-md border-2 bg-white mb-2 p-4">
            <h4 className="scroll-m-20 font-medium text-base tracking-tight flex justify-between">
                <span
                    className={cn(
                        'cursor-pointer hover:text-primary',
                        isSelected ? 'text-primary' : 'text-inherit'
                    )}
                    onClick={onSelectItemClicked}
                >
                    {zone.name}
                </span>
                <span>
                    <Button
                        size="icon"
                        className="text-destructive bg-white hover:bg-danger active:bg-danger-pressed cursor-pointer"
                        onClick={onRemoveClicked}
                    >
                        <Trash2 />
                    </Button>
                    <Button
                        asChild
                        size="icon"
                        className="text-primary bg-white hover:bg-accent active:bg-accent2 cursor-pointer"
                    >
                        <Link href={`/dashboard/zone/edit/${zone.id}`}>
                            <Edit />
                        </Link>
                    </Button>
                </span>
            </h4>
            <Separator />
            <dl className="mt-4 space-y-4">
                {/* ✅ Surface Area */}
                <div className="flex">
                    <dt className="w-40 shrink-0 font-medium text-gray">
                        {t('zones.item.surface_area')}
                    </dt>
                    <dd className="text-gray-900">
                        {zone.areaSize} {t('zones.item.km')}
                    </dd>
                </div>

                {/* ✅ City / Province */}
                <div className="flex">
                    <dt className="w-40 shrink-0 font-medium text-gray">
                        {t('zones.item.city_province')}
                    </dt>
                    <dd className="flex flex-wrap gap-2 text-gray2 font-medium">
                        {zone.provinces?.map((item, index) => (
                            <span
                                key={index}
                                className="cursor-pointer text-sm items-center flex bg-accent2 rounded-sm px-2"
                            >
                                {item.name}
                            </span>
                        ))}
                    </dd>
                </div>

                {/* ✅ Districts */}
                <div className="flex">
                    <dt className="w-40 shrink-0 font-medium text-gray">
                        {t('zones.item.districts')}
                    </dt>
                    <dd className="flex flex-wrap gap-2 text-gray2 font-medium">
                        {zone.districts?.map((item, index) => (
                            <span
                                key={index}
                                className="text-sm cursor-pointer rounded-sm px-2 border border-primary"
                            >
                                {item.districtName}
                            </span>
                        ))}
                    </dd>
                </div>
            </dl>
        </div>
    );
};

export default ZoneItem;
