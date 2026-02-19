// @/utils/status-utils.ts

import { UserStatus } from '@/models/status';
import { t } from 'i18next';

/**
 * Returns the Tailwind CSS background class based on the Status ID.
 * This is a pure function and can be used anywhere.
 */
export const getUserStatusBGClass = (statusId: number): string => {
    switch (statusId) {
        case UserStatus.Inactive:
            return 'bg-inactive';
        case UserStatus.Active:
            return 'bg-success';
        case UserStatus.New:
            return 'bg-primary';
        case UserStatus.Cancel:
            return 'bg-destructive';
        default:
            return 'bg-primary';
    }
};

export const getUserStatusTextClass = (statusId: number): string => {
    switch (statusId) {
        case UserStatus.Inactive:
            return 'text-inactive';
        case UserStatus.Active:
            return 'text-success';
        case UserStatus.New:
            return 'text-primary';
        case UserStatus.Cancel:
            return 'text-destructive';
        default:
            return 'text-primary';
    }
};

export const getUserStatusLabel = (statusId: number): string => {
    switch (statusId) {
        case UserStatus.Inactive:
            return t('common.status.inactive');
        case UserStatus.Active:
            return t('common.status.active');
        case UserStatus.New:
            return t('common.status.new');
        case UserStatus.Cancel:
            return t('common.status.cancel');
        default:
            return t('common.status.unknown');
    }
};

export const getUserStatusColor = (statusId: number) => {
    const bgClass = getUserStatusBGClass(statusId);
    const textClass = getUserStatusTextClass(statusId);
    const label = getUserStatusLabel(statusId);
    return { bgClass, textClass, label };
};
