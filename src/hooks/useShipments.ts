import { TaskStatus } from '@/app/dashboard/shipments/(form)/shipment.form.service';
import { ShipmentImportData } from '@/app/dashboard/shipments/bulk/bulk.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import {
    CommonPaginationParams,
    ParcelRequestBody
} from '@/models/request.model';
import {
    PagedResponse,
    ParcelData,
    ParcelResponseBody
} from '@/models/response.model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---

export interface ShipmentFilters extends CommonPaginationParams {
    page: number;
    status?: number[];
    syncStatus?: number[];
    type?: number[];
    warehouseIds?: string[];
}

// --- Queries ---

export const useGetShipments = ({
    searchText = '',
    fromDate = '',
    toDate = '',
    top = 15,
    page = 1,
    status = [TaskStatus.New, TaskStatus.Assigned],
    warehouseIds = []
}: ShipmentFilters) => {
    const skip = top * (page - 1);

    return useQuery<PagedResponse<ParcelData>>({
        queryKey: [
            'shipments',
            'list',
            { skip, status, top, searchText, fromDate, toDate, warehouseIds }
        ],
        queryFn: async () => {
            const res = await mAxios.get<PagedResponse<ParcelData>>(
                process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments',
                {
                    params: {
                        skip,
                        status: status.join(','),
                        top,
                        searchText,
                        fromDate,
                        toDate,
                        warehouseIds:
                            warehouseIds.length > 0
                                ? warehouseIds.join(',')
                                : ''
                    }
                }
            );

            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData, // Standardized for smooth pagination
        refetchOnWindowFocus: false
    });
};

export const useGetShipmentDetail = (id: string | null | undefined) => {
    return useQuery<ParcelData>({
        queryKey: ['shipments', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await mAxios.get<ParcelResponseBody>(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/${id}`
            );
            return res.data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

// --- Mutations ---

export const useCreateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ParcelRequestBody) => {
            const { data } = await mAxios.post(
                process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments',
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
        }
    });
};

export const useUpdateShipment = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ParcelRequestBody) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/${id}`,
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['shipments', id] });
        }
    });
};

export const useDeleteShipments = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const { data } = await mAxios.post(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/bulk-delete`,
                ids
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments', 'list'] });
        }
    });
};

export const useUpdateShipmentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            status,
            note
        }: {
            id: string;
            status: number;
            note?: string;
        }) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/${id}/status`,
                { status, note }
            );
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({
                queryKey: ['shipments', variables.id]
            });
        }
    });
};

export const useImportShipments = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ShipmentImportData[]) => {
            const { data } = await mAxios.post(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/bulk`,
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        }
    });
};
