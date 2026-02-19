'use client';

import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import QRGeneratDialog from '@/components/QRCode/QRGenerateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useGetUserDetail } from '@/hooks/useUsers';
import { getFormattedDate } from '@/lib/dayjs';
import { getUserStatusColor } from '@/lib/user-status';
import { cn } from '@/lib/utils';
import { Edit, Loader2, ScanQrCode } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserViewDetailsProps {
    userId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserViewDetails({
    userId,
    open,
    onOpenChange
}: UserViewDetailsProps) {
    const [openQrDialog, setOpenQrDialog] = useState(false);
    const { t } = useTranslation();

    // 1. Fetch data only when dialog is intended to be open
    const { data: user, isLoading } = useGetUserDetail(userId);

    // 2. Consistent Header Actions
    const dialogContent: BaseViewDetailsDialogContent = {
        title: t('users.view_details.title'),
        text: t('users.view_details.view_text'),
        actions: (
            <div className="flex justify-between w-full items-center">
                <div className="flex items-center">
                    {user && (
                        <>
                            <Button type="button" asChild variant="ghost">
                                <Link href={`/dashboard/user/edit/${user.id}`}>
                                    <Edit
                                        size={24}
                                        strokeWidth={1.5}
                                        className="cursor-pointer text-primary hover:text-hover transition-colors"
                                    />
                                </Link>
                            </Button>
                            {/* Adding QR Action if URL exists */}
                            {user.dynamicActiveurl && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpenQrDialog(true)}
                                    className="cursor-pointer text-primary hover:text-hover transition-colors"
                                >
                                    <ScanQrCode size={24} strokeWidth={1.5} />
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <DialogClose asChild>
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer text-sm px-4"
                    >
                        {t('users.view_details.close')}
                    </Button>
                </DialogClose>
            </div>
        )
    };

    return (
        <>
            <BaseViewDialog
                isOpen={open}
                onOpenChange={onOpenChange}
                dialogContent={dialogContent}
            >
                {/* 3. Improved Loading State: Keep dialog open, show spinner */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        <p className="text-sm text-secondary-foreground">
                            {t('users.view_details.loading')}
                        </p>
                    </div>
                )}

                {!isLoading && user && (
                    <div className="space-y-5">
                        {/* Profile Section */}
                        <div className="flex flex-col items-center">
                            <Avatar className="w-24 h-24 border-2 border-gray-100 shadow-sm">
                                <AvatarImage
                                    src={user.profileUrl ?? ''}
                                    alt={user.username}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-accent text-primary font-bold text-xl">
                                    {user.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-medium mt-4 text-gray-900">
                                {user.username}
                            </h3>
                        </div>

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-secondary-foreground text-xs">
                                    {t('users.view_details.fullname')}
                                </p>
                                <p className="text-sm font-medium">
                                    {user.username}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs">
                                    {t('users.view_details.registration_date')}
                                </p>
                                <p className="text-sm font-medium">
                                    {user.dateCreate
                                        ? getFormattedDate(user.dateCreate)
                                        : t('common.not_available')}
                                </p>
                            </div>

                            <div>
                                <p className="text-secondary-foreground text-xs">
                                    {t('users.view_details.login_id')}
                                </p>
                                <p className="text-sm font-medium">
                                    {user.loginPhone}
                                </p>
                            </div>

                            <div>
                                <p className="text-secondary-foreground text-xs">
                                    {t('users.view_details.role')}
                                </p>
                                <p className="text-sm font-medium">
                                    {user.isAdmin
                                        ? t('users.form.sections.role.admin')
                                        : t('users.form.sections.role.user')}
                                </p>
                            </div>
                            <div>
                                <p className="text-secondary-foreground text-xs">
                                    {t('users.view_details.status')}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusLabel status={user.status} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Warehouse */}
                        <div>
                            <p className="text-secondary-foreground text-xs">
                                {t('users.view_details.assigned_warehouse')}
                            </p>
                            <p className="text-sm font-medium">
                                {user.warehouse?.name ??
                                    t(
                                        'users.form.sections.role.warehouse_all_label'
                                    )}
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && !user && (
                    <div className="text-center py-10 text-secondary-foreground">
                        {t('users.view_details.not_found')}
                    </div>
                )}
            </BaseViewDialog>

            {/* 4. Integrated QR Sub-Dialog */}
            {user?.dynamicActiveurl && (
                <QRGeneratDialog
                    open={openQrDialog}
                    onOpenChange={setOpenQrDialog}
                    qrType={t('users.view_details.qr_access')}
                    value={user.dynamicActiveurl}
                />
            )}
        </>
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
