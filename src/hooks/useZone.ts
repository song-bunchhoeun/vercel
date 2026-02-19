import {
    ZoneRequest,
    ZoneResponse
} from '@/app/dashboard/zone/(form)/zone.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---

export interface ListFormValues {
    top: number;
    page: number;
    searchText?: string;
    status?: number | null; // Added to match standardized status logic
    fromDate?: string;
    toDate?: string;
}

export interface ZoneListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: ZoneResponse[];
}

// --- Queries ---

export const useGetListZones = ({
    searchText = '',
    top = 15,
    page = 1,
    status = null
}: ListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<ZoneListResponse>({
        queryKey: ['zones', 'list', { skip, top, searchText, status }],
        queryFn: async () => {
            const { data } = await mAxios.get<ZoneListResponse>(
                process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones',
                {
                    params: { skip, top, searchText, status }
                }
            );
            return data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData, // Better UX during pagination
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useGetZoneDetail = (id: string | null | undefined) => {
    return useQuery<ZoneResponse>({
        queryKey: ['zones', id],
        enabled: !!id, // Safety: Only fetch if ID exists
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones'}/${id}`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

// --- Mutations ---

export const useCreateZone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ZoneRequest) => {
            const { data } = await mAxios.post(
                process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones',
                payload
            );
            return data;
        },
        onSuccess: () => {
            // Broad invalidation for consistency across the dashboard
            queryClient.invalidateQueries({ queryKey: ['zones'] });
        }
    });
};

export const useUpdateZone = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ZoneRequest) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones'}/${id}`,
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            queryClient.invalidateQueries({ queryKey: ['zones', id] });
        }
    });
};

export const useUpdateZoneStatus = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: number) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones'}/${id}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            queryClient.invalidateQueries({ queryKey: ['zones', id] });
        }
    });
};

export const useDeleteZone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await mAxios.delete(
                `${process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones'}/${id}`
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
        }
    });
};
