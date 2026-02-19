import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useGetDriver } from '@/hooks/useDrivers';
import { getFormattedDate } from '@/lib/dayjs';
import { getUserStatusColor } from '@/lib/user-status';
import { cn } from '@/lib/utils';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface DriverViewDetailsProps {
    driverId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DriverViewDetails({
    driverId,
    open,
    onOpenChange
}: DriverViewDetailsProps) {
    const { data: driver, isLoading } = useGetDriver(driverId);
    const { t } = useTranslation();

    if (isLoading || !driver) {
        return null;
    }

    // Zone
    const zoneName =
        driver.zone && typeof driver.zone === 'object' ? driver.zone.name : '';

    const dialogContent: BaseViewDetailsDialogContent = {
        title: t('drivers.view_details.title'),
        text: t('drivers.view_details.view_text'),
        actions: (
            <div className="flex justify-between w-full items-center">
                <div className="flex items-center">
                    <Button asChild className="cursor-pointer" variant="ghost">
                        <Link
                            href={`/dashboard/driver/edit/${driver.id ?? ''}`}
                        >
                            <Edit
                                size={20}
                                strokeWidth={1.5}
                                className="cursor-pointer text-primary"
                            />
                        </Link>
                    </Button>
                </div>
                <DialogClose asChild>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer text-sm sm:text-base px-3 sm:px-4"
                    >
                        {t('drivers.view_details.close')}
                    </Button>
                </DialogClose>
            </div>
        )
    };

    return (
        <BaseViewDialog
            isOpen={open}
            onOpenChange={onOpenChange}
            dialogContent={dialogContent}
        >
            <div className="flex justify-center">
                <div>
                    <div className="flex justify-center">
                        <Avatar className="w-[96px] h-[96px]">
                            <AvatarImage
                                src={driver.profileUrl ?? '/no_image_data.png'}
                                alt="User avatar"
                            />
                            <AvatarFallback>
                                {t('drivers.view_details.no_image')}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="text-xl font-medium mt-3">
                        {driver.username}
                    </p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.name')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.username ?? ''}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.id')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.id}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.created_date')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {getFormattedDate(driver.dateCreate)}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.nid')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.nid ?? ''}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.primary_phone')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.primaryPhone ?? ''}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.secondary_phone')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.secondaryPhone ?? ''}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.assigned_zone')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {zoneName}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {t('drivers.view_details.assigned_fleet')}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                        {driver.fleetType ?? ''}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-gray-500 text-xs sm:text-sm">
                    {t('drivers.view_details.status')}
                </p>
                <StatusLabel status={driver.status} />
            </div>
        </BaseViewDialog>
    );
}

const StatusLabel = ({ status }: { status: number }) => {
    const statusObj = getUserStatusColor(status);
    return (
        <span className={cn(`text-sm font-medium`, statusObj.textClass)}>
            {statusObj.label}
        </span>
    );
};
