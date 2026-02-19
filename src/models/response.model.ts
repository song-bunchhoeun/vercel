/**
 * =============================================================================
 * BASE WRAPPERS
 * =============================================================================
 */
export interface BaseResponse<T> {
    success: boolean;
    statusCode: number;
    message: string | null;
    data: T;
    timestamp: string;
}

export interface PagedResponse<T> {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: T[];
}

export interface EnumDto {
    key: string | null;
    value: number;
    display: string | null;
}

/**
 * =============================================================================
 * CUSTOMER MODULE
 * =============================================================================
 */
export interface CustomerAddress {
    id: string;
    customerId: string;
    line: string | null;
    label: string | null;
    latitude: number;
    longitude: number;
    note: string | null;
}

export interface CustomerData {
    id: string;
    merchantId: string | null;
    name: string | null;
    gender: string | null;
    dateCreate: string | null;
    primaryPhone: string | null;
    secondaryPhone: string | null;
    hasSubscribed: boolean | null;
    addresses: CustomerAddress[] | null;
    totalShipments: number;
}

export type CustomerResponseBody = BaseResponse<CustomerData>;
export type CustomerPagedResponseBody = BaseResponse<
    PagedResponse<CustomerData>
>;

/**
 * =============================================================================
 * DRIVER MODULE
 * =============================================================================
 */
export interface DriverData {
    id: string;
    userId: string | null;
    merchantId: string | null;
    username: string | null;
    ssoId?: string | null;
    gender?: string | null;
    dob?: string | null;
    nid: string | null;
    address?: string | null;
    email?: string | null;
    status: number | null;
    remark?: string | null;
    primaryPhone: string | null;
    secondaryPhone: string | null;
    telegramId?: string | null;
    profileUrl: string | null;
    dateCreate: string | null;
    dynamicActiveurl?: string | null;
    fleetType: 'Motorcycle' | 'Tuktuk' | 'Truck' | string;
    totalDispatched: number;
    zoneId: string | null;
    role: {
        id: number;
        name: string | null;
        dateCreate?: string;
    };
    zone: ZoneData;
}

export type DriverResponseBody = BaseResponse<DriverData>;
export type DriverPagedResponseBody = BaseResponse<PagedResponse<DriverData>>;

/**
 * =============================================================================
 * WAREHOUSE MODULE
 * =============================================================================
 */
export interface WarehouseDoc {
    id: string;
    name: string | null;
    url: string | null;
}

export interface WarehouseData {
    id: string;
    merchantId: string | null;
    name: string | null;
    status: number | null;
    address: string | null;
    primaryPhone: string | null;
    secondaryPhone: string | null;
    createDate: string | null;
    geo: string | null;
    latitude: number | null;
    longitude: number | null;
    documents: WarehouseDoc[] | null;
}

export type WarehouseResponseBody = BaseResponse<WarehouseData>;
export type WarehousePagedResponseBody = BaseResponse<
    PagedResponse<WarehouseData>
>;

/**
 * =============================================================================
 * JOBS MODULE
 * =============================================================================
 */
export interface Geometry {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface JobAddress {
    label: string | null;
    address: string | null;
    note: string | null;
    geometry: Geometry;
}

export interface TaskData {
    taskId: string;
    taskType: number;
    status: number;
    shipmentId: string;
    parcelMetaId: string;
    trackingNumber: string;
    shipmentType: string;
    note: string | null;
    itemQty: number;
    itemAmount: number;
    customerData: {
        customerName: string | null;
        primaryPhoneNumber: string | null;
        address: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

export interface VisitData {
    visitId: string;
    addressId: string;
    address: JobAddress;
    customerId: string | null;
    shipmentIds: string[];
    customerName: string | null;
    warehouseName: string | null;
    sequenceOrder: number;
    estimatedArrivalTime: string;
    estimatedDepartureTime: string;
    workingTimeMinutes: number;
    visitType: string;
    taskTypes: string[];
    tasks: TaskData[];

    // --- Strictly Typed Injections from Web Worker ---
    statusColor?: string;
    statusBg?: string;
    statusBorder?: string;
    statusLabel?: string;
}

export interface JobDriverData {
    driverId: string;
    profileUrl?: string;
    username: string; // Used for fallback
    name: string;
    phone: string;
    zone: string;
}

export interface JobOptimizationData {
    jobId: string;
    driverId: string;
    driver: JobDriverData;
    departureTime: string;
    estArrivalTime: string;
    shipmentIds: string[];
    visits: VisitData[];

    // --- Strictly Typed Injections from Web Worker ---
    currentVisit?: VisitData;

    optimizationDetails?: {
        provider: string | null;
        totalTravelTime: number;
        fallbackUsed: boolean;
        optimizationMethodUsed: string | null;
        driverAvailabilityChecked: boolean;
    };
    metrics?: {
        distanceKm: number | null;
        totalHours: number | null;
        totalShipments: number;
        completedCount: number;
        failedCount: number;
        estimatedHours: number;
        arrivalHour: number;
    };
    createdAt: string;
    dispatchedAt: string | null;
    startedAt?: string | null;
    status: string;
    dgcApproved: boolean;
    deliveryDate: string | null;
}
export interface MappedJob {
    jobId: string;
    driverId: string;
    driver: {
        id: string;
        username: string;
        primaryPhone: string | null;
        profileUrl?: string;
        zone: {
            name: string;
        };
        fleetType: string;
        role: {
            name: string;
        };
    };
    departureTime: string;
    estArrivalTime: string | null;
    shipmentIds: string[];
    visits: VisitData[];
    optimizationDetails?: {
        provider: string | null;
        totalTravelTime: number;
    };
}

// Exported Alias for component imports
export type Job = JobOptimizationData;

export interface JobOptimizationResponse {
    value: Job[];
    unassignedShipments: ParcelData[];
}

export interface MappedJobResponse {
    value: MappedJob[];
    unassignedShipments: ParcelData[];
}

export type JobOptimizationResponseBody = BaseResponse<JobOptimizationResponse>;
export type JobDetailsPagedResponseBody = BaseResponse<PagedResponse<Job>>;

/**
 * =============================================================================
 * PARCEL (SHIPMENT) MODULE
 * =============================================================================
 */
export interface ParcelData {
    id: string;
    merchantId: string;
    dpShipmentId?: string;
    date: string;
    createDate: string;
    deliveryDate: string;
    taskType: number;
    note: string | null;
    status: number;
    syncStatus: number;
    missingStatus: number | null;
    version: number;
    warehouseId: string;
    warehouse: WarehouseData;
    customer: {
        id: string;
        name: string;
        gender: string | null;
        primaryPhone: string;
        secondaryPhone: string | null;
    };
    address: {
        id: string;
        addressId: string;
        status: number;
        line: string;
        label: string | null;
        latitude: number;
        longitude: number;
        note: string | null;
    };
    item: {
        id: string;
        qty: number;
        kg: number;
        size: string | null;
        unit: number;
        amount: number;
        currencyType: number;
    };
    dropoff?: {
        id: string | null;
        note: string;
        photos: Array<{ id: string | null; photoUrl: string }>;
    };
    history?: Array<{
        date: string;
        title: string;
        description: string;
        note: string;
        type: number;
        status: number;
    }>;
}

export type ParcelResponseBody = BaseResponse<ParcelData>;
export type ParcelPagedResponseBody = BaseResponse<PagedResponse<ParcelData>>;

/**
 * =============================================================================
 * ZONE MODULE
 * =============================================================================
 */
export interface ZoneData {
    id: string;
    name: string | null;
    merchantId: string | null;
    areaSize?: number | null;
    type?: string;
    dateCreate?: string | null;
    provinces?: Array<{ id: number; name: string | null }>;
    districts?: Array<{ id: number; districtName: string | null }>;
    polygon?: Geometry | null;
}

export type ZoneResponseBody = BaseResponse<ZoneData>;
export type ZonePagedResponseBody = BaseResponse<PagedResponse<ZoneData>>;
