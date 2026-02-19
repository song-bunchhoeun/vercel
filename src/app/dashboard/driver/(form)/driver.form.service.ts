import z from 'zod';

export interface ZoneData {
    id: string;
    name: string;
}

export interface DriverRequestData {
    id?: string;
    username: string;
    photo?: File | null;
    profileUrl?: string;
    nid?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    zoneId: string;
    fleetType?: string;
    status?: number;
}

export interface DriverResponseData {
    id: string;
    profileUrl: string;
    username: string;
    nid: string;
    zoneId: string;
    zone: ZoneData;
    fleetType: string;
    secondaryPhone?: string;
    primaryPhone: string;
    totalDispatched: string;
    status: number;
    dynamicActiveurl: string;
    dateCreate?: string;
}

export const driverDefaultValues: DriverRequestData = {
    username: '',
    photo: null,
    nid: '',
    zoneId: '',
    fleetType: '',
    primaryPhone: '',
    secondaryPhone: '',
    status: 2 // Default set to New
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const driverSchema = z.object({
    username: z
        .string()
        .min(1, 'Driver Name is required')
        .max(100, 'Driver Name maximum length is 100'),
    photo: z
        .unknown()
        .optional()
        .refine(
            (val) => !val || (val instanceof File && val.size <= MAX_FILE_SIZE),
            'Max image size is 3MB'
        ),
    nid: z.string().optional(),
    primaryPhone: z.string().min(9, 'Invalid format').max(10),
    secondaryPhone: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => !val || (val.length >= 9 && val.length <= 10),
            'Invalid format'
        ),
    zoneId: z.string().min(1, 'Zone is required'),
    fleetType: z.string().optional(),
    profileUrl: z.string().optional()
});
