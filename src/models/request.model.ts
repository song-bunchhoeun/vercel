/**
 * =============================================================================
 * SHARED REQUEST TYPES
 * =============================================================================
 */
export type OrderBy = 'ASC' | 'DESC';

export interface CommonPaginationParams {
    searchText?: string;
    fromDate?: string; // ISO DateTime
    toDate?: string; // ISO DateTime
    order?: string;
    orderBy?: OrderBy;
    skip?: number;
    top?: number;
    apiVersion?: string; // Mapped from query "api-version"
}

/**
 * =============================================================================
 * CUSTOMER MODULE
 * =============================================================================
 */
export interface CustomerRequestParams extends CommonPaginationParams {
    id?: string; // Path parameter (UUID)
}

/**
 * =============================================================================
 * DRIVER MODULE
 * =============================================================================
 */
export interface DriverRequestParams extends CommonPaginationParams {
    id?: string; // Path parameter
    status?: number; // UserStatus Enum
    zoneId?: string; // UUID
}

export interface DriverRequestBody {
    photo?: File | Blob; // multipart/form-data
}

export interface DriverStatusRequestBody {
    status: number; // UserStatus Enum
}

/**
 * =============================================================================
 * JOBS MODULE
 * =============================================================================
 */
export interface JobsRequestParams extends CommonPaginationParams {
    id?: string; // Path parameter
    status?: number[]; // JobStatus Enums
}

export interface JobsAutoAssignOptimizeRequestBody {
    shipmentIds?: string[];
    driverIds?: string[];
    driverDepartureTimes?: Array<{
        driverId: string;
        departureTime: string;
    }>;
}

export interface JobsManualAssignRequestBody {
    shipmentIds?: string[];
    driverId: string;
    jobId?: string;
    departureTime: string;
    workingTimeMinutesDefault: number;
}

export interface JobsManualSequenceRequestBody {
    visitSequences?: Array<{
        visitId: string;
        sequenceOrder: number;
    }>;
    departureTime: string;
}

export interface JobsUnassignRequestBody {
    shipmentIds?: string[];
}

/**
 * =============================================================================
 * PARCEL (SHIPMENT) MODULE
 * =============================================================================
 */
export interface ParcelRequestParams extends CommonPaginationParams {
    id?: string;
    status?: string[]; // ParcelStatus strings
    type?: number;
    customerId?: string;
    missingStatus?: number;
}

export interface ParcelRequestBody {
    id?: string;
    merchantId?: string;
    warehouseId?: string;
    date?: string;
    taskType: number;
    note?: string;
    status?: number;
    customer: {
        id?: string;
        name: string;
        primaryPhone: string;
        secondaryPhone?: string;
    };
    address: {
        id?: string;
        addressId?: string;
        line: string;
        label?: string | null;
        latitude: number;
        longitude: number;
        note?: string;
    };
    item: {
        qty: number;
        amount: number;
        currencyType: number;
    };
}

/**
 * 🛠️ Fixed: Converted from interface to type alias to satisfy
 * @typescript-eslint/no-empty-object-type
 */
export type ParcelBulkRequestBody = Array<{
    taskType: number;
    note?: string;
    customer: { name: string; primaryPhone: string };
    address: {
        line: string;
        label?: string;
        latitude: number;
        longitude: number;
    };
    item: { qty: number; amount: number; currencyType: number };
}>;

export interface ParcelUpdateStatusRequestBody {
    status: string; // ParcelStatus string
    note?: string;
}

/**
 * =============================================================================
 * USER MODULE
 * =============================================================================
 */
export interface UserRequestParams extends CommonPaginationParams {
    id?: string;
    status?: number;
    roleId?: number;
}

export interface UserRequestBody {
    photo?: File | Blob;
}

export interface UserStatusRequestBody {
    status: number;
}

/**
 * =============================================================================
 * WAREHOUSE MODULE
 * =============================================================================
 */
export interface WarehouseRequestParams extends CommonPaginationParams {
    id?: string;
    status?: number;
}

export interface WarehouseRequestBody {
    name: string;
    address?: string;
    primaryPhone?: string;
    secondaryPhone?: string;
    latitude?: string;
    longitude?: string;
    files?: Array<File | Blob>;
}

/**
 * =============================================================================
 * ZONE MODULE
 * =============================================================================
 */
export interface ZoneRequestParams extends CommonPaginationParams {
    id?: string;
}

export interface ZoneRequestBody {
    name: string;
    areaSize: number;
    countryId?: number;
    provinceIds?: number[];
    districtIds?: number[];
    //eslint-disable-next-line
    customPolygon?: any;
}
