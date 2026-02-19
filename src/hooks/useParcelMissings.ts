import { ParcelMissingBadgeCount } from '@/app/dashboard/parcel-missing/parcel.missing.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { CommonPaginationParams } from '@/models/request.model';
import { PagedResponse, ParcelData } from '@/models/response.model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ListFormValues extends CommonPaginationParams {
    page: number;
    status?: number[];
    type?: number[];
}

export const useGetParcelMissings = ({
    searchText = '',
    fromDate = '',
    toDate = '',
    top = 15,
    page = 1
}: ListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<PagedResponse<ParcelData>>({
        queryKey: [
            'parcel-missings',
            'list',
            { skip, top, searchText, fromDate, toDate }
        ],
        queryFn: async () => {
            const res = await mAxios.get<PagedResponse<ParcelData>>(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/missing`,
                {
                    params: {
                        skip,
                        top,
                        searchText,
                        fromDate,
                        toDate
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

export function useUpdateParcelStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            missingStatus,
            note
        }: {
            id: string;
            missingStatus: number;
            note?: string;
        }) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/${id}/missing/status`,
                { missingStatus, note }
            );
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['parcel-missings'] });
            queryClient.invalidateQueries({
                queryKey: ['parcel-missings', variables.id]
            });
        }
    });
}

export const useGetParcelMissingsBadge = () => {
    return useQuery<ParcelMissingBadgeCount>({
        queryKey: ['parcel-missings'],
        queryFn: async () => {
            const res = await mAxios.get(
                `${process.env.NEXT_PUBLIC_SHIPMENT_ENDPOINT ?? '/shipments'}/count`
            );
            return res.data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};
