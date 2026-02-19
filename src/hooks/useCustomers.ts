import { CustomerResponseData } from '@/app/dashboard/customers/customer.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import {
    CustomerData,
    PagedResponse,
    ParcelData
} from '@/models/response.model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface CustomerListParams {
    top: number;
    page: number;
    searchText?: string;
    fromDate?: string;
    toDate?: string;
    status?: number | null;
}

export interface CustomerListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: CustomerResponseData[];
}

export interface CustomerShipmentHistories {
    customerId: string;
    status?: number[];
    top: number;
    page: number;
}

// --- Queries ---

export interface CustomerListParams {
    top: number;
    page: number;
    searchText?: string;
    fromDate?: string;
    toDate?: string;
    status?: number | null;
    customerId?: string; // ✅ Added to match component state
}

export const useGetListCustomers = ({
    searchText = '',
    fromDate = '',
    toDate = '',
    top = 15,
    page = 1,
    status = null,
    customerId = ''
}: CustomerListParams) => {
    const skip = top * (page - 1);

    return useQuery<PagedResponse<CustomerData>>({
        // ✅ Added status and customerId to queryKey for proper cache invalidation
        queryKey: [
            'customers',
            'list',
            { skip, top, searchText, fromDate, toDate, status, customerId }
        ],
        queryFn: async () => {
            const { data } = await mAxios.get<PagedResponse<CustomerData>>(
                process.env.NEXT_PUBLIC_CUSTOMER_ENDPOINT ?? '/customers',
                {
                    params: {
                        skip,
                        top,
                        searchText,
                        fromDate,
                        toDate,
                        status,
                        customerId
                    }
                }
            );
            return data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false
    });
};

export const useGetCustomerDetail = (id: string | null | undefined) => {
    return useQuery<CustomerResponseData>({
        queryKey: ['customers', id],
        enabled: !!id,
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_CUSTOMER_ENDPOINT ?? '/customers'}/${id}`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

export const useGetShipmentHistory = ({
    customerId,
    top = 15,
    page = 1,
    status = [1]
}: CustomerShipmentHistories) => {
    const skip = top * (page - 1);

    return useQuery<PagedResponse<ParcelData>>({
        queryKey: ['customers', 'shipments', customerId, { status, skip, top }],
        enabled: !!customerId,
        queryFn: async () => {
            const res = await mAxios.get<PagedResponse<ParcelData>>(
                process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments',
                {
                    params: {
                        customerId,
                        status: status.join(','),
                        skip,
                        top
                    }
                }
            );
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false
    });
};

// --- Mutations ---

export const useUpdateCustomerStatus = (id?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status: number) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_CUSTOMER_ENDPOINT ?? '/customers'}/${id}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });
};

export const useUpdateCustomer = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CustomerResponseData) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_CUSTOMER_ENDPOINT ?? '/customers'}/${id}`,
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customers', id] });
        }
    });
};
