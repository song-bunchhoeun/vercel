import { DriverResponseData } from '@/app/dashboard/driver/(form)/driver.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---

export interface ListFormValues {
    top: number;
    page: number;
    searchText?: string;
    status?: number | null;
    fromDate?: string;
    toDate?: string;
}

export interface DriverListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: DriverResponseData[];
}

interface DriverEditReponseData {
    statusCode: number;
    message: string;
    data: DriverResponseData;
}

export interface FleetTypeDropdownData {
    value: string;
    key: string;
    display: string;
}

export interface FleetTypeDropdownListData {
    data: FleetTypeDropdownData[];
}

export interface ZoneDropdownData {
    id: string;
    name: string;
}

export interface ZoneDropdownListData {
    value: ZoneDropdownData[];
}

// --- Queries ---

export const useGetListDrivers = ({
    searchText = '',
    fromDate = '',
    toDate = '',
    top = 15,
    page = 1,
    status = null
}: ListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<DriverListResponse>({
        queryKey: [
            'drivers',
            'list',
            { skip, top, searchText, status, fromDate, toDate }
        ],
        queryFn: async () => {
            const { data } = await mAxios.get<DriverListResponse>(
                process.env.NEXT_PUBLIC_DRIVER_ENDPOINT ?? '/drivers',
                { params: { skip, top, searchText, status, fromDate, toDate } }
            );
            return data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (previousData) => previousData
    });
};

export const useGetDriver = (id: string | null | undefined) => {
    return useQuery<DriverResponseData>({
        queryKey: ['drivers', id],
        enabled: !!id,
        queryFn: async () => {
            const { data } = await mAxios.get<DriverEditReponseData>(
                `${process.env.NEXT_PUBLIC_DRIVER_ENDPOINT ?? '/drivers'}/${id}`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useGetZoneList = () => {
    return useQuery<ZoneDropdownListData>({
        queryKey: ['zones'],
        queryFn: async () => {
            const { data } = await mAxios.get<ZoneDropdownListData>(
                process.env.NEXT_PUBLIC_ZONE_ENDPOINT ?? '/zones'
            );
            return data;
        },
        staleTime: 60 * 60 * 1000, // Zones change rarely, 1 hour stale time is safer
        refetchOnWindowFocus: false
    });
};

export const useGetFleetTypeList = () => {
    return useQuery<FleetTypeDropdownListData>({
        queryKey: ['fleet'],
        queryFn: async () => {
            const { data } = await mAxios.get<FleetTypeDropdownListData>(
                process.env.NEXT_PUBLIC_FLEET_TYPE_ENDPOINT ?? '/fleet'
            );
            return data;
        },
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

// --- Mutations ---

export const useCreateDriver = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await mAxios.post(
                process.env.NEXT_PUBLIC_DRIVER_ENDPOINT ?? '/drivers',
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: () => {
            // Broad invalidation is safer for Driver ecosystem
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
    });
};

export const useUpdateDriver = (id: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_DRIVER_ENDPOINT ?? '/drivers'}/${id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
    });
};

export const useUpdateDriverStatus = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: number) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_DRIVER_ENDPOINT ?? '/drivers'}/${id}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
    });
};
