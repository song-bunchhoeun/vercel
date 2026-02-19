import { z } from 'zod';

export enum MissingStatus {
    Missing = 2,
    Found = 3
}

export const parcelMissingListSchema = z.object({
    searchText: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    top: z.number(),
    page: z.number()
});

export type ParcelMissingListParams = z.infer<typeof parcelMissingListSchema>;

export interface ParcelMissingBadgeCount {
    totalCount: number;
    statusCounts: [
        {
            status: string;
            count: number;
        }
    ];
}
