import { ParcelRequestBody } from '@/models/request.model';
import { z, type ZodType } from 'zod';

/* =============================================================================
   Enums
   ============================================================================= */

export enum AddressStatus {
    NotFound = 2,
    Invalid = 4
}

export enum TaskType {
    DropOff = 1,
    PickUp = 2
}

export enum Currency {
    khr = 1,
    usd = 2
}

export enum TaskStatus {
    New = 1,
    InTransit = 2,
    Arrived = 3,
    Delivered = 4,
    PickedUp = 5,
    Failed = 6,
    Assigned = 8
}
/* =============================================================================
   UI Form Models
   ============================================================================= */
export interface ShipmentCustomerAddressForm {
    addressId: string;
    label: string;
    line: string;
    latitude: number;
    longitude: number;
}

export interface ShipmentCustomerForm {
    id?: string;
    name: string;
    primaryPhone: string;
    secondaryPhone?: string;
    address: ShipmentCustomerAddressForm;
}

export interface ShipmentFormModel {
    customer: ShipmentCustomerForm;
    // 🎯 FIX: Changed to string to support IMaskInput value tracking for QTY
    qty: string;
    taskType: TaskType;
    // 🎯 FIX: Changed to string to support IMaskInput value tracking for Amount
    amount: string;
    currency: Currency;
    warehouseId: string;
    note?: string;
}

/* =============================================================================
   Zod Validation Schema
   ============================================================================= */
export const shipmentSchema: ZodType<ShipmentFormModel> = z.object({
    customer: z.object({
        id: z.string().optional(),
        name: z
            .string()
            .min(1, "Customer's name is required")
            .max(100, `Customer's name maximum length is 100`),
        primaryPhone: z
            .string()
            .min(9, 'Primary Phone Number invalid format.')
            .max(10, 'Primary Phone Number must be at most 10 digits.'),
        secondaryPhone: z
            .string()
            .trim()
            .or(z.literal(''))
            .optional()
            .pipe(
                z
                    .string()
                    .refine(
                        (val) =>
                            val === '' || (val.length >= 9 && val.length <= 10),
                        {
                            message:
                                'Secondary Phone Number must be between 9 and 10 digits'
                        }
                    )
            ),
        address: z.object({
            addressId: z.string(),
            label: z.string(),
            line: z.string().min(1, 'Delivery address is required'),
            latitude: z.coerce.number(),
            longitude: z.coerce.number()
        })
    }),
    // 🎯 FIX: Validate string input as a numeric value for QTY
    qty: z
        .string()
        .refine((val) => !isNaN(Number(val)), { message: 'Invalid quantity' })
        .refine((val) => Number(val) >= 1, {
            message: 'Parcel QTY must be at least 1'
        }),
    taskType: z
        .union([z.string(), z.number()])
        .transform((v) => Number(v) as TaskType),
    // 🎯 FIX: Validate string input as a numeric value for Amount
    amount: z
        .string()
        .refine((val) => !isNaN(Number(val)), { message: 'Invalid amount' })
        .refine((val) => Number(val) >= 0, {
            message: 'Amount must be greater or equal 0'
        }),
    currency: z
        .union([z.string(), z.number()])
        .transform((v) => Number(v) as Currency),
    warehouseId: z.string().min(1, 'Warehouse is required'),
    note: z.string().optional()
});

/* =============================================================================
   Default Values
   ============================================================================= */
export const shipmentDefaultValues: ShipmentFormModel = {
    customer: {
        name: '',
        primaryPhone: '',
        secondaryPhone: '',
        address: {
            addressId: '',
            label: '',
            line: '',
            latitude: 11.5564, // Phnom Penh Default
            longitude: 104.9282
        }
    },
    qty: '1', // 🎯 FIX: Set as string
    taskType: TaskType.DropOff,
    amount: '0', // 🎯 FIX: Set as string
    currency: Currency.khr,
    warehouseId: '',
    note: ''
};

/* =============================================================================
   Mapper: Form -> API
   ============================================================================= */
export const mapFormToParcelRequest = (
    data: ShipmentFormModel
): ParcelRequestBody => {
    return {
        taskType: data.taskType,
        warehouseId: data.warehouseId,
        note: data.note,
        customer: {
            id: data.customer.id || undefined,
            name: data.customer.name,
            primaryPhone: data.customer.primaryPhone,
            secondaryPhone: data.customer.secondaryPhone
        },
        address: {
            addressId: checkUUID(data.customer.address.addressId)
                ? String(data.customer.address.addressId)
                : undefined,
            line: data.customer.address.line,
            label: data.customer.address.label ?? '',
            latitude: data.customer.address.latitude,
            longitude: data.customer.address.longitude
        },
        item: {
            // 🎯 FIX: Convert string values back to numbers for the API payload
            qty: Number(data.qty) || 1,
            amount: Number(data.amount) || 0,
            currencyType: data.currency
        }
    };
};

const uuidSchema = z.uuid();
const checkUUID = (id: string | null) => {
    if (!id) return false;
    return uuidSchema.safeParse(id).success;
};
