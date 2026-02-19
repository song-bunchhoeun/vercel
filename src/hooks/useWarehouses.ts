import { Warehouse } from '@/app/dashboard/warehouse/(form)/warehouse.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ListFormValues {
    top: number;
    page: number;
    searchText?: string;
    fromDate?: string;
    toDate?: string;
    order?: string;
    orderBy?: string;
    status?: string;
}

export interface WarehouseListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: Warehouse[];
}

export const useWarehouses = (params: ListFormValues) => {
    // Destructure with defaults for cleaner code
    const {
        searchText = '',
        fromDate = '',
        toDate = '',
        top = 15,
        page = 1,
        order = 'name',
        orderBy = 'ASC',
        status = ''
    } = params;

    // Derived state: calculation logic kept separate from the query definition
    const skip = top * (page - 1);

    return useQuery<WarehouseListResponse>({
        // 1. Keep the object keys consistent for stable cache keys
        queryKey: [
            'warehouses',
            'list',
            { skip, top, searchText, fromDate, toDate, order, orderBy, status }
        ],

        // 2. Pass params directly to axios (Axios handles undefined/empty strings better)
        queryFn: async () => {
            const { data } = await mAxios.get<WarehouseListResponse>(
                process.env.NEXT_PUBLIC_WAREHOUSE_ENDPOINT ?? '/warehouses',
                {
                    params: {
                        skip,
                        top,
                        searchText,
                        fromDate,
                        toDate,
                        order,
                        orderBy,
                        status
                    }
                }
            );
            return data;
        },

        staleTime: 5 * 60 * 1000,

        // 3. Recommended Change: Use placeholderData instead of initialData
        placeholderData: (previousData) => previousData,

        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useCreateWarehouse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: FormData) => {
            // 1. Destructure data for cleaner return
            const { data } = await mAxios.post(
                process.env.NEXT_PUBLIC_WAREHOUSE_ENDPOINT ?? '/warehouses',
                payload,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            return data;
        },
        onSuccess: () => {
            // 2. Invalidation
            // Since you are using a detailed queryKey object in the list hook,
            // ['warehouses', 'list'] without exact: false is enough to
            // wipe all paginated/filtered lists under that key.
            queryClient.invalidateQueries({
                queryKey: ['warehouses', 'list']
            });
        }
    });
};

export const useUpdateWarehouse = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_WAREHOUSE_ENDPOINT ?? '/warehouses'}/${id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: () => {
            // Invalidate everything related to warehouses
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
};

export const useUpdateWarehouseStatus = (id?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status: number) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_WAREHOUSE_ENDPOINT ?? '/warehouses'}/${id}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
};

export const useGetWarehouseDetail = (id: string) => {
    return useQuery<Warehouse>({
        queryKey: ['warehouses', id],
        queryFn: async () => {
            // FIX: Use the same endpoint variable as the others for consistency
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_WAREHOUSE_ENDPOINT ?? '/warehouses'}/${id}`
            );
            return data.data;
        },
        enabled: !!id, // Prevent fetching if ID is missing
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};
