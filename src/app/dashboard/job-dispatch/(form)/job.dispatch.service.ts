import z from 'zod';

export enum SHIPMENT_TASK_TYPE {
    DropOff = 1,
    PickUp = 2
}

export enum PARCEL_SYNC_STATUS {
    NEW = 1,
    UPDATE = 2,
    PROCESSING = 3,
    FAILED = 4,
    SYNCED = 5
    //Cancelled = 6
}

export enum SHIPMENT_TASK_STATUS {
    NEW = 1,
    IN_TRANSIT = 2,
    ARRIVED = 3,
    DELIVERED = 4,
    PICKED_UP = 5,
    FAILED = 6
}

export enum JOB_STATUS {
    DRAFT = 'draft',
    DISPATCHED = 'dispatched',
    ACTIVE = 'active',
    COMPLETED = 'completed'
}

export enum DRIVER_STATUS {
    NEW = 2,
    ACTIVE = 1,
    INACTIVE = 0
}

/** * Labels for the TaskTypeMultiSelect
 */
export const TASK_TYPE_OPTIONS = [
    { label: 'Drop-Off', value: SHIPMENT_TASK_TYPE.DropOff },
    { label: 'Pick-Up', value: SHIPMENT_TASK_TYPE.PickUp }
];

export enum PARCEL_ADDRESS_STATUS {
    CUSTOMER_PROVIDED = 1,
    TODO = 2,
    SUCCESS = 3,
    FAILED = 4
}

/** * Data shape for Step 1 (Shipment Selection)
 */
export interface ShipmentCardData {
    id: string;
    dpShipmentId: string;
    name: string;
    syncStatus: number;
    address: {
        id: string | null;
        status: number;
        line: string;
        latitude: number;
        longitude: number;
    };
    primaryPhone: string;
    secondaryPhone: string;
    qty: number;
    amount: number;
    currencyType: number;
    note: string;
    status: number;
    taskType: number;
}

/** * Data shape for Step 2 (Driver Selection)
 */
export interface DriverCardData {
    id: string;
    name: string;
    phone: string;
    zone?: string;
    avatar?: string;
}

/** * Data shape for List View / Detail View Tasks
 */
export interface TasksProps {
    id: string;
    name: string;
    coord: { lat: number; lng: number; address: string };
    isWarehouse?: boolean;
    taskType: number;
    taskStatus: number;
    primaryPhone: string;
    secondPhone?: string;
    qty?: number;
    amount?: number;
    note?: string;
}

export interface JobDispatchListProps {
    id: string;
    name: string;
    taskType: number;
    taskStatus: number;
    taskList: TasksProps[];
    driver?: DriverCardData;
}

// --- FLOW CONSTANTS ---
export const CURRENT_STEP = { ONE: 1, TWO: 2, THREE: 3 } as const;
export type Step = 1 | 2 | 3;

export const DISPATCH_STATUS = {
    dispatch: {
        label: 'job_dispatch.list_page.tabs.dispatch',
        value: 0
    },
    inTransit: {
        label: 'job_dispatch.list_page.tabs.in_transit',
        value: 1
    },
    completed: {
        label: 'job_dispatch.list_page.tabs.completed',
        value: 3
    }
} as const;

export const SHIPMENT_STATUS = {
    inTransit: { label: 'In-Transit', value: 1, color: 'bg-orange-400' },
    arrived: { label: 'Arrived', value: 2, color: 'bg-red-700' },
    delivered: { label: 'Delivered', value: 3, color: 'bg-green-500' },
    failed: { label: 'Failed', value: 4, color: 'bg-red-500' }
} as const;

export const getShipmentStatusByValue = (value?: number) =>
    Object.values(SHIPMENT_STATUS).find((s) => s.value === value);

// --- VALIDATION & DEFAULTS ---
export const JobDispatchSchema = z.object({
    shipmentIds: z.array(z.string()).min(1, 'Select at least one shipment'),
    driverIds: z.array(z.string()).min(1, 'Assign at least one driver'),
    driverDepartureTimes: z
        .array(
            z.object({
                driverId: z.string(),
                departureTime: z.string().datetime()
            })
        )
        .optional()
});

export const SoloJobDispatchSchema = z.object({
    shipmentIds: z.array(z.string()).min(1, 'Select at least one shipment'),
    driverId: z.string().min(1, 'Assign at least one driver'),
    driverDepartureTimes: z
        .array(
            z.object({
                driverId: z.string(),
                departureTime: z.string().datetime()
            })
        )
        .optional()
});

export type JobDispatchRequest = z.infer<typeof JobDispatchSchema>;
export type SoloDispatchRequest = z.infer<typeof SoloJobDispatchSchema>;

/** * Exported default values for BaseForm initialization
 */
export const JobDispatchDefaultValues: JobDispatchRequest = {
    shipmentIds: [],
    driverIds: []
};

/**
 * Standardized Schema for List Page Filters
 * Used by BaseForm to provide context to Search and DatePicker components.
 */
export const JobDispatchListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    status: z.number().nullable().optional(),
    top: z.number().default(15),
    page: z.number().default(1)
});

export type JobDispatchListFilters = z.infer<typeof JobDispatchListSchema>;

/**
 * Standardized Default Values
 */
export const JobDispatchListDefaultValues: JobDispatchListFilters = {
    searchText: '',
    fromDate: '',
    toDate: '',
    top: 15,
    page: 1,
    status: null
};

// step 3
export interface CustomerData {
    customerName: string;
    primaryPhoneNumber: string;
    address: string;
}

export type TaskType = 'pickup' | 'delivery' | string;

export interface Task {
    taskId: string;
    type: TaskType;
    status: 'offered' | 'assigned' | 'completed' | 'failed' | string;
    shipmentId: string;
    parcelMetaId: string;
    trackingNumber: string;
    shipmentType: string;
    note: string;
    itemQty: number;
    itemAmount: number;
    customerData: CustomerData;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface Role {
    id: number;
    name: string;
    accessId: number | null;
    dateCreate: string; // ISO
}

export interface Zone {
    id: string;
    name: string;
    merchantId: string;
    type: string;
    dateCreate: string; // ISO
    areaSize: number | null;
    provinces: string[] | null;
    districts: string[] | null;
    polygon: unknown | null; // can refine later if geojson
}

export interface Driver {
    driverId: string;
    userId: string;
    merchantId: string;
    name: string;
    ssoId: string | null;
    gender: 'Male' | 'Female' | string;
    dob: string; // ISO date
    nid: string;
    address: string;
    email: string | null;
    status: number;
    remark: string;
    primaryPhone: string;
    secondaryPhone: string | null;
    telegramId: string;
    profileUrl: string;
    dateCreate: string; // ISO
    dynamicActiveurl: string | null;
    fleetType: 'Motorcycle' | 'Car' | string;
    totalDispatched: number;
    zoneId: string;
    role: Role;
    zone: Zone;
}

export interface VisitAddress {
    label: string;
    address: string;
    note?: string;
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface Visit {
    visitId: string;
    addressId: string;
    address: VisitAddress;
    customerId: string;
    customerName: string;
    warehouseName: string;
    sequenceOrder: number;
    estimatedArrivalTime: string; // ISO
    estimatedDepartureTime: string; // ISO
    workingTimeMinutes: number;
    visitType: 'customer' | 'warehouse' | string;
    taskTypes: TaskType[];
    tasks: Task[];
}

export interface Metrics {
    distanceKm: number;
    totalHours: number;
    totalShipments: number;
    completedCount: number;
    failedCount: number;
    estimatedHours: number;
    arrivalHour: number;
}

export interface Job {
    jobId: string;
    status: string;
    driverId: string;
    driver: Driver;
    departureTime: string; // ISO
    shipmentIds: string[];
    visits: Visit[];
    metrics: Metrics;
}

export interface UnassignedShipment {
    shipmentId: string;
    trackingNumber: string;
    reason: string;
    shipment: {
        id: string;
        merchantId: string;
        date: string; // ISO datetime
        createDate: string; // ISO datetime
        deliveryDate: string; // YYYY-MM-DD
        taskType: number;
        note: string;
        status: number;
        syncStatus: number;
        dpShipmentId: string;
        missingStatus: number;
        version: number;
        customer: {
            id: string;
            name: string;
            gender: string;
            primaryPhone: string;
            secondaryPhone: string;
        };
        address: {
            id: string;
            addressId: string;
            status: number;
            line: string;
            label: string;
            latitude: number;
            longitude: number;
            note: string;
        };
        item: {
            id: string;
            qty: number;
            kg: number;
            size: string;
            unit: number;
            amount: number;
            currencyType: number;
        };
        dropoff: {
            photos: {
                id: string;
                photoUrl: string;
            }[];
        };
        movements: {
            date: string;
            title: string;
            description: string;
            note: string;
        }[];
    };
}

export interface JobOptimizationData {
    value: Job[];
    unassignedShipments: UnassignedShipment[];
}

export interface JobOptimizationResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: JobOptimizationData;
    timestamp: string; // ISO
}

export interface ManualAssignPayload {
    shipmentIds: string[];
    driverId: string;
    jobId: string;
}

export interface DispatchJobIdsPayload {
    jobIds: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}
