import { z } from 'zod';

// ----------------------------------
// 🧱 Form data interface
// ----------------------------------
export interface WarehouseDocument {
    id: string | number; // Aligned with schema
    name: string;
    url: string;
}

export interface WarehouseFormData {
    id?: string;
    name: string;
    address: string;
    // Allow null for the initial state to avoid 'undefined' warnings
    latitude: number | null;
    longitude: number | null;
    primaryPhone: string;
    secondaryPhone?: string;
    status?: number;
    files?: File[];
    documents?: WarehouseDocument[];
}

// ----------------------------------
// 🗄️ Warehouse model (DB context)
// ----------------------------------
export interface Warehouse extends WarehouseFormData {
    id: string;
    merchant_id?: number;
    remarks?: string;
    admins?: string;
    users?: string;
    district_id?: string;
    is_delete?: number;
    status: number;
    createDate: string;
}

// ----------------------------------
// 🎯 Default values
// ----------------------------------
export const warehouseDefaultValues: WarehouseFormData = {
    name: '',
    address: '',
    latitude: null, // Semantically "no value selected"
    longitude: null,
    primaryPhone: '',
    secondaryPhone: '',
    status: 1,
    files: [],
    documents: []
};

// ----------------------------------
// ✅ Zod validation schema
// ----------------------------------
// Regex for phone: allows only digits, 9-10 chars
const phoneRegex = /^\d{9,10}$/;

export const warehouseSchema = z.object({
    name: z
        .string()
        .min(1, 'Warehouse name is required')
        .max(100, `Warehouse name maximum length is 100`),
    address: z.string().min(1, 'Address is required'),

    // Using .refine handles the 'Required' logic for null values
    latitude: z
        .number()
        .nullable()
        .refine((val) => val !== null, 'Please pin the location on the map'),
    longitude: z
        .number()
        .nullable()
        .refine((val) => val !== null, 'Please pin the location on the map'),

    primaryPhone: z
        .string()
        .regex(phoneRegex, 'Invalid format (9-10 digits required)'),
    secondaryPhone: z
        .string()
        .optional()
        .transform((val) => (val === '' ? undefined : val)) // Convert empty string to undefined
        .refine((val) => !val || phoneRegex.test(val), {
            message: 'Invalid format (9-10 digits required)'
        }),
    files: z
        .array(z.instanceof(File)) // Fix: Use instanceof File instead of z.file()
        .max(3, 'Maximum 3 files allowed')
        .optional()
        .default([]),
    documents: z
        .array(
            z.object({
                id: z.union([z.string(), z.number()]), // Fix: Type mismatch with interface
                name: z.string(),
                url: z.string()
            })
        )
        .optional()
});
