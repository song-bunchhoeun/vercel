import z from 'zod';

// --- Interfaces ---

export interface CustomerAddress {
    id?: string;
    customerId?: string;
    label: string;
    line: string;
    latitude: number;
    longitude: number;
    note?: string;
    default?: boolean;
}

export interface CustomerResponseData {
    id: string;
    merchantId?: string;
    name: string;
    gender?: string;
    dateCreate?: string;
    primaryPhone: string;
    secondaryPhone: string;
    totalShipments?: number;
    status: number; // ✅ Standardized: 0 (Inactive), 1 (Active)
    addresses: CustomerAddress[];
}

/**
 * Interface for Create/Update payloads
 */
export interface CustomerRequest {
    id?: string;
    name: string;
    gender?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    status?: number; // ✅ For ActiveStatusToggle
    addresses: CustomerAddress[];
}

export interface ShipmentHistory {
    date: string;
    driverName: string;
    status: string;
}

/**
 * ✅ FIX: Use Omit to prevent the Type incompatibility error.
 * This allows 'status' to be a string for Shipments while
 * remaining a number for Customer Accounts.
 */
export interface ShipmentResponseData extends Omit<
    CustomerResponseData,
    'status'
> {
    shipmentId: string;
    parrcelQty: string;
    shipmentCreateDate: string;
    collectAmount: string;
    type: string;
    status: string; // Logistics status (e.g., "Delivered")
    note: string;
    driverNote: string;
    images: string[];
    shipmentHistory: ShipmentHistory[];
}

export interface ShipmentHistoryResponse {
    customerId: string;
    shipments: ShipmentResponseData[];
}

// ----------------------------------
// 🎯 Default values for form
// ----------------------------------
export const customerDefaultValues: CustomerRequest = {
    name: '',
    gender: 'Male',
    primaryPhone: '',
    secondaryPhone: '',
    status: 1, // Default to Active
    addresses: []
};

// ----------------------------------
// ✅ Zod validation schema
// ----------------------------------
export const customerSchema = z.object({
    name: z
        .string()
        .min(1, 'Customer name is required')
        .max(100, 'Customer name maximum length is 100'),
    gender: z.string().optional(),
    primaryPhone: z.string().min(1, 'Primary phone is required'),
    secondaryPhone: z.string().optional(),
    status: z.number().optional(),
    addresses: z
        .array(
            z.object({
                label: z
                    .string()
                    .min(1, 'Address label is required (e.g. Home, Office)'),
                line: z.string().min(1, 'Address details are required'),
                latitude: z.number(),
                longitude: z.number(),
                note: z.string().optional(),
                default: z.boolean().optional()
            })
        )
        .min(1, 'At least one address is required')
});
