import { Warehouse } from '@/app/dashboard/warehouse/(form)/warehouse.form.service';
import z from 'zod';

export interface UserRequestData {
    id?: string;
    username: string;
    phoneNumber: string;
    warehouseId?: string;
    profileUrl?: string;
    photo?: File | null;
    dynamicActiveurl?: string;
    previewUrl?: string;
    isAdmin: boolean;
    role?: string;
    status?: number;
}

export interface UserResponseData {
    id: string;
    username: string;
    loginPhone: string;
    status: number;
    dateCreate: string;
    warehouse: Warehouse;
    profileUrl?: string;
    isAdmin: boolean;
    dynamicActiveurl: string;
}

export const userDefaultValues: UserRequestData = {
    username: '',
    isAdmin: false,
    phoneNumber: '',
    status: 2,
    warehouseId: undefined
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const userSchema = z
    .object({
        username: z
            .string()
            .min(1, 'Full name is required')
            .max(50, 'Full name reached max length (50)'),
        phoneNumber: z
            .string()
            .min(9, 'Phone Number invalid format.')
            .max(10, 'Phone Number must be at most 10 digits.'),
        isAdmin: z.boolean(), // Removed deprecated required_error
        warehouseId: z.string().optional(),
        profileUrl: z.string().optional(),
        photo: z
            .any()
            .optional()
            .refine(
                (file) =>
                    !file ||
                    (file instanceof File && file.size <= MAX_FILE_SIZE),
                'Max image size is 3MB'
            )
    })
    .refine(
        (data) => {
            if (data.isAdmin) return true;
            return !!data.warehouseId && data.warehouseId !== 'all';
        },
        {
            message: 'Warehouse is required for Standard Users',
            path: ['warehouseId']
        }
    );
