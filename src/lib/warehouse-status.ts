// @/utils/status-utils.ts

import { WarehouseStatus } from '@/models/status';
import { t } from 'i18next';

/**
 * Returns the Tailwind CSS background class based on the Status ID.
 * This is a pure function and can be used anywhere.
 */
export const getWHStatusBGClass = (statusId: number): string => {
    return statusId === WarehouseStatus.Active ? 'bg-success' : 'bg-inactive';
};

export const getWHStatusTextClass = (statusId: number): string => {
    return statusId === WarehouseStatus.Active
        ? 'text-success'
        : 'text-inactive';
};

export const getWHStatusLabel = (statusId: number): string => {
    return statusId === WarehouseStatus.Active
        ? t('common.status.active')
        : t('common.status.inactive');
};

export const getWHStatusColor = (statusId: number) => {
    const bgClass = getWHStatusBGClass(statusId);
    const textClass = getWHStatusTextClass(statusId);
    const label = getWHStatusLabel(statusId);
    return { bgClass, textClass, label };
};
