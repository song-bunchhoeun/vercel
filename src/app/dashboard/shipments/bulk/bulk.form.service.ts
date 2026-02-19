import z from 'zod';

/* =========================
 * BULK IMPORT INTERFACES
 * ======================= */
export enum CurrencyType {
    RIEL = 'Riel (៛)',
    DOLLAR = 'Dollars ($)'
}

export enum TaskType {
    DROP_OFF = 'Drop off',
    PICK_UP = 'Pick-up'
}

export enum ERROR_TYPE {
    INVALID_FILE = 'invalid-file',
    NO_DATA = 'no-data'
}

export const DOWNLOAD_ASSETS = {
    SHIPMENT_TEMPLATE: {
        URL: '/template/shipment_template_file.xlsx',
        FILENAME: 'shipment_template_file.xlsx'
    }
};
/* =========================
 * BULK IMPORT INTERFACES
 * ======================= */
export interface ShipmentImportData {
    customer: {
        name: string;
        primaryPhone: string;
    };
    address: {
        label?: string;
        line: string;
        latitude?: number;
        longitude?: number;
    };
    item: {
        qty: number | string;
        amount?: number | string;
        currencyType?: CurrencyType;
    };
    taskType: TaskType;
    warehouseId: string;
    note?: string;
}

// ✅ Corrected schema for Enums and Coercion
export const shipmentRowSchema = z.object({
    customer: z.object({
        name: z
            .string()
            .min(1, 'Name is required')
            .max(100, `Name maximum length is 100`),
        primaryPhone: z
            .string()
            .transform((val) => val.replace(/\D/g, '')) // 🚀 Strip everything except digits first
            .pipe(z.string().min(9, 'Too short').max(10, 'Too long'))
    }),
    address: z.object({
        line: z.string().min(1, 'Address is required')
    }),
    item: z.object({
        qty: z.coerce
            .number({
                message: 'Quantity must be a number'
            })
            .min(1, 'Quantity is required'),
        amount: z.coerce
            .number({
                message: 'Amount must be a number'
            })
            .optional(),
        currencyType: z
            .string()
            .min(1, 'Currency is required')
            .pipe(
                z.enum([CurrencyType.RIEL, CurrencyType.DOLLAR], {
                    message: 'Currency invalid format'
                })
            )
    }),
    taskType: z
        .string()
        .min(1, 'Task type is required')
        .pipe(
            z.enum([TaskType.DROP_OFF, TaskType.PICK_UP], {
                message: 'Task Type invalid format'
            })
        ),
    warehouseId: z.string().min(1, 'Warehouse is required'),
    note: z.string().optional()
});
