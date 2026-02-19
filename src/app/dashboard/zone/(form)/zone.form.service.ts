import z from 'zod';

// --- Interfaces ---

export interface ZoneRequest {
    id?: string; // Standardized to string (UUID) to match API Response
    name: string;
    areaSize: number;
    countryId: number;
    provinceIds?: number[];
    districtIds?: number[];
    customPolygon?: GeoJSON.Feature[];
    status?: number; // ✅ Standardized: 0 (Inactive), 1 (Active), 2 (New)
}

export interface ZoneProvince {
    id: number;
    name: string;
    countryId: number;
    districts?: ZoneDistrict[];
}

export interface ZoneDistrict {
    id: number;
    districtId?: number;
    districtName?: string;
    zoneId: string;
    name: string;
    polygon: GeoJSON.Feature[] | null;
}

export interface ZoneResponse {
    id: string;
    name: string;
    merchantId: string | null;
    type: string;
    dateCreate: string;
    areaSize: number | null;
    status: number; // ✅ Standardized
    provinces: ZoneProvince[];
    districts: ZoneDistrict[];
    polygon: GeoJSON.Feature[];
}

// ----------------------------------
// 🎯 Default values for form
// ----------------------------------
export const zoneDefaultValues: ZoneRequest = {
    name: '',
    areaSize: 0,
    countryId: 1, // Defaulting to Cambodia ID
    provinceIds: [],
    districtIds: [],
    customPolygon: [],
    status: 1
};

// ----------------------------------
// ✅ Zod validation schema
// ----------------------------------
export const zoneSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Zone name is required')
            .max(100, `Warehouse name maximum length is 100`),
        areaSize: z.number().min(0).optional(),
        countryId: z.number().min(1, 'Country selection is required'),
        provinceIds: z.array(z.number()).optional(),
        // Limit individual arrays to max 1 item
        districtIds: z.array(z.number()).max(1, 'Select only one district'),
        customPolygon: z
            .array(z.any())
            .max(1, 'Only one custom zone is allowed'),
        status: z.number().optional()
    })
    .superRefine((data, ctx) => {
        const distCount = data.districtIds?.length ?? 0;
        const polyCount = data.customPolygon?.length ?? 0;
        const totalCount = distCount + polyCount;

        // Rule: Exactly 1 item must exist across both fields
        if (totalCount === 0) {
            const message = 'You must select 1 district or draw 1 custom zone';
            ctx.addIssue({
                code: 'custom',
                path: ['districtIds'],
                message
            });
            ctx.addIssue({
                code: 'custom',
                path: ['customPolygon'],
                message
            });
        }

        if (totalCount > 1) {
            const message =
                'You can only have one selection (District OR Custom Zone)';
            ctx.addIssue({
                code: 'custom',
                path: ['districtIds'],
                message
            });
            ctx.addIssue({
                code: 'custom',
                path: ['customPolygon'],
                message
            });
        }
    });
