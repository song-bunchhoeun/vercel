import { PARCEL_SYNC_STATUS } from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import {
    TaskStatus,
    TaskType
} from '@/app/dashboard/shipments/(form)/shipment.form.service';

export interface FilterItem {
    value: string;
    label: string;
    translateKey?: string;
    color?: string;
}
export interface FilterTaskType {
    value: TaskStatus;
    label: string;
    translateKey?: string;
    color?: string;
}

export interface ParcelStatus {
    key: string;
    value: number;
    display: string;
    translateKey?: string;
    color: string;
}

export const roleDropDownFilter: FilterItem[] = [
    { value: 'all', label: 'All', translateKey: 'common.status.all' },
    { value: '1', label: 'Admin', translateKey: 'common.filters.roles.admin' },
    { value: '2', label: 'User', translateKey: 'common.filters.roles.user' }
];

export const driverDropDownFilter: FilterItem[] = [
    { value: 'all', label: 'All', translateKey: 'common.status.all' },
    {
        value: '2',
        label: 'New',
        translateKey: 'common.filters.driver_status.new',
        color: 'blue'
    },
    {
        value: '1',
        label: 'Active',
        translateKey: 'common.filters.driver_status.active',
        color: 'green'
    },
    {
        value: '0',
        label: 'Inactive',
        translateKey: 'common.filters.driver_status.inactive',
        color: 'gray'
    }
];

export const zoneDropDownFilter: FilterItem[] = [
    {
        value: 'Zone A',
        label: 'Zone A',
        translateKey: 'zones.list_page.filters.zone_a'
    },
    {
        value: 'Zone B',
        label: 'Zone B',
        translateKey: 'zones.list_page.filters.zone_b'
    },
    {
        value: 'Zone C',
        label: 'Zone C',
        translateKey: 'zones.list_page.filters.zone_c'
    },
    {
        value: 'Zone D',
        label: 'Zone D',
        translateKey: 'zones.list_page.filters.zone_d'
    }
];

export const fleetDropDownFilter: FilterItem[] = [
    {
        value: 'Motorbike',
        label: 'Motorbike',
        translateKey: 'common.filters.fleets.motorbike'
    },
    {
        value: 'Tuk Tuk',
        label: 'Tuk Tuk',
        translateKey: 'common.filters.fleets.tuk_tuk'
    },
    { value: 'Car', label: 'Car', translateKey: 'common.filters.fleets.car' },
    {
        value: 'Truck',
        label: 'Truck',
        translateKey: 'common.filters.fleets.truck'
    }
];

export const shipmentStatusFilter = [
    {
        value: [TaskStatus.New, TaskStatus.Assigned],
        label: 'New',
        translateKey: 'common.status.new'
    },
    {
        value: [TaskStatus.InTransit, TaskStatus.Arrived],
        label: 'In-Transit',
        translateKey: 'common.status.in_transit'
    },
    {
        value: [TaskStatus.Delivered, TaskStatus.PickedUp],
        label: 'Completed',
        translateKey: 'common.status.completed'
    },
    {
        value: [TaskStatus.Failed],
        label: 'Failed',
        translateKey: 'common.status.failed'
    }
] as const;

export const syncStatus: Record<
    number,
    {
        label: string;
        translateKey: string;
        color: string;
    }
> = {
    [PARCEL_SYNC_STATUS.NEW]: {
        label: 'Pending',
        translateKey: 'common.status.pending',
        color: 'bg-warning-500'
    },
    [PARCEL_SYNC_STATUS.UPDATE]: {
        label: 'Pending',
        translateKey: 'common.status.pending',
        color: 'bg-warning-500'
    },
    [PARCEL_SYNC_STATUS.PROCESSING]: {
        label: 'Pending',
        translateKey: 'common.status.pending',
        color: 'bg-warning-500'
    },
    [PARCEL_SYNC_STATUS.FAILED]: {
        label: 'Failed',
        translateKey: 'common.status.failed',
        color: 'bg-destructive'
    },
    [PARCEL_SYNC_STATUS.SYNCED]: {
        label: 'Synced',
        translateKey: 'common.status.synced',
        color: 'bg-success-500'
    }
} as const;

export const PARCEL_STATUS: ParcelStatus[] = [
    {
        key: 'New',
        value: TaskStatus.New,
        display: 'New',
        translateKey: 'common.status.new',
        color: 'bg-primary'
    },
    {
        key: 'InTransit',
        value: TaskStatus.InTransit,
        display: 'In Transit',
        translateKey: 'common.status.in_transit',
        color: 'bg-warning-500'
    },
    {
        key: 'Arrived',
        value: TaskStatus.Arrived,
        display: 'Arrived',
        translateKey: 'common.status.arrived',
        color: 'bg-warning-700'
    },
    {
        key: 'Delivered',
        value: TaskStatus.Delivered,
        display: 'Delivered',
        translateKey: 'common.status.delivered',
        color: 'bg-success-500'
    },
    {
        key: 'PickedUp',
        value: TaskStatus.PickedUp,
        display: 'Picked Up',
        translateKey: 'common.status.picked_up',
        color: 'bg-success-800'
    },
    {
        key: 'Failed',
        value: TaskStatus.Failed,
        display: 'Failed',
        translateKey: 'common.status.failed',
        color: 'bg-error-500'
    },
    {
        key: 'Assigned',
        value: TaskStatus.Assigned,
        display: 'Assigned',
        translateKey: 'common.status.assigned',
        color: 'bg-warning-200'
    }
];

export const getStatusMeta = (status?: TaskStatus): ParcelStatus => {
    return (
        PARCEL_STATUS.find((s) => s.value === status) ?? {
            key: 'Unknown',
            value: status ?? 0,
            display: 'Unknown',
            translateKey: 'common.status.unknown',
            color: 'bg-micon-primary'
        }
    );
};

export const dropOffStatusFilter: ParcelStatus[] = [
    getStatusMeta(TaskStatus.InTransit),
    getStatusMeta(TaskStatus.Arrived),
    getStatusMeta(TaskStatus.Delivered),
    getStatusMeta(TaskStatus.Failed)
];

export const pickUpStatusFilter: ParcelStatus[] = [
    getStatusMeta(TaskStatus.InTransit),
    getStatusMeta(TaskStatus.Arrived),
    getStatusMeta(TaskStatus.PickedUp),
    getStatusMeta(TaskStatus.Failed)
];

const getStatusFilterByTaskType = (taskType?: number): ParcelStatus[] => {
    return taskType === TaskType.DropOff
        ? dropOffStatusFilter
        : pickUpStatusFilter;
};

export const getAvailableStatusOptions = (
    taskType?: number,
    currentStatus?: number
): ParcelStatus[] => {
    if (currentStatus == null) return [];

    if (
        [TaskStatus.Delivered, TaskStatus.PickedUp, TaskStatus.Failed].includes(
            currentStatus
        )
    ) {
        return [];
    }

    const baseOptions = getStatusFilterByTaskType(taskType);

    if (currentStatus === TaskStatus.Arrived) {
        return baseOptions.filter(
            (option) => option.value !== TaskStatus.InTransit
        );
    }

    return baseOptions;
};
