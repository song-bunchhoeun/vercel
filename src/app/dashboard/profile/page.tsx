'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Components
import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import FormPageTitle from '@/components/BaseForm/FormPageTitle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Hooks & Lib
import { useGetUserProfile } from '@/hooks/useUsers';
import { logout } from '@/lib/logout';
import { getFormattedDate } from '@/lib/dayjs';

interface LabelValueGroupProps {
    label: string;
    value: string | number;
    className?: string;
}

/**
 * Reusable display group using semantic muted-foreground and foreground tokens
 */
const LabelValueGroup = ({ label, value, className }: LabelValueGroupProps) => {
    return (
        <div className="col-span-4 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {label}
            </p>
            <h4
                className={cn(
                    'text-sm font-semibold text-foreground tracking-tight',
                    className
                )}
            >
                {value}
            </h4>
        </div>
    );
};

const MyProfile = () => {
    const { t } = useTranslation();
    const { data: profile, isLoading } = useGetUserProfile();

    if (isLoading) return null;

    return (
        <BaseFormLayout>
            {/* Main Profile Card - Using --card and --border tokens */}
            <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
                <FormPageTitle
                    title={t('profile.title')}
                    subtitle={t('profile.subtitle')}
                />

                {profile && (
                    <div className="flex flex-col gap-8 mt-8">
                        {/* Avatar - Using --accent token for fallback */}
                        <div className="w-24 h-24">
                            <Avatar className="w-24 h-24 border border-border shadow-xs">
                                <AvatarImage
                                    src={
                                        profile.profileUrl ??
                                        '/no_image_data.png'
                                    }
                                    alt={profile.username}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-accent text-accent-foreground font-bold text-xl">
                                    {profile.username
                                        ?.substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Information Grid Section */}
                        <div className="grid grid-cols-12 gap-y-8">
                            <LabelValueGroup
                                label={t('profile.username')}
                                value={profile.username}
                            />
                            <LabelValueGroup
                                label={t('profile.createdDate')}
                                value={getFormattedDate(profile.dateCreate)}
                            />
                            <LabelValueGroup
                                label={t('profile.status')}
                                value={
                                    profile.status === 1 ? 'Active' : 'Inactive'
                                }
                                // Using hex-dir1ect or custom utility for semantic success/error
                                className={
                                    profile.status === 1
                                        ? 'text-[#1db240]'
                                        : 'text-destructive'
                                }
                            />

                            <LabelValueGroup
                                label={t('profile.role')}
                                value={profile.role?.name || '---'}
                            />
                            <LabelValueGroup
                                label={t('profile.phoneNumber')}
                                value={profile.loginPhone}
                            />
                            <LabelValueGroup
                                label={t('profile.assignedWareHouse')}
                                value={
                                    profile.isAdmin
                                        ? t('warehouse.all_warehouses')
                                        : profile.warehouse?.name || '---'
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar - Styled with primary and destructive-outline tokens */}
            <div className="flex justify-end gap-4 items-center bg-card p-4 rounded-lg mt-4 border border-border shadow-sm">
                {profile?.isAdmin && (
                    <Button
                        asChild
                        variant="default"
                        className="bg-primary text-primary-foreground font-bold px-8 shadow-md transition-all cursor-pointer"
                    >
                        <Link href="/dashboard/profile/edit">
                            {t('profile.btnEdit')}
                        </Link>
                    </Button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    className="font-bold text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive px-6 cursor-pointer"
                    onClick={() => logout()}
                >
                    {t('profile.btnLogout')}
                </Button>
            </div>
        </BaseFormLayout>
    );
};

export default MyProfile;
