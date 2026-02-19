'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mAxios } from '@/interceptors/axios.interceptor';
import {
    ApiResponse,
    DispatchJobIdsPayload,
    Job,
    JobDispatchRequest,
    JobOptimizationResponse,
    ManualAssignPayload,
    SoloDispatchRequest
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';

export const useCreateJobDispatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: JobDispatchRequest) => {
            return (
                await mAxios.post(
                    `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/auto-assign-optimize`,
                    payload
                )
            ).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        }
    });
};

export const useCreateSoloJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SoloDispatchRequest) => {
            return (
                await mAxios.post(
                    `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/solo-assign`,
                    payload
                )
            ).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        }
    });
};

export const useManualAssign = () => {
    return useMutation({
        mutationFn: async (payload: ManualAssignPayload) => {
            const res = await mAxios.post(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/manual-assign`,

                payload
            );

            return res.data;
        }
    });
};

export const useChangeJobDriver = () => {
    return useMutation({
        mutationFn: async (payload: ManualAssignPayload) => {
            const res = await mAxios.post(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/visits/change-driver`,
                payload
            );

            return res.data;
        }
    });
};

export const useRemoveShipment = () => {
    return useMutation({
        mutationFn: async ({
            jobId,
            shipmentIds
        }: {
            jobId: string;
            shipmentIds: string[];
        }) => {
            const res = await mAxios.post(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/${jobId}/unassign`,
                {
                    shipmentIds
                }
            );

            return res.data;
        }
    });
};

export interface JobListFormValues {
    jobIds?: string[];
    top: number;
    page: number;
    status?: string;
}

export const useRefetchJobOptimization = ({
    jobIds = [],
    top = 15,
    page = 1,
    status = 'draft'
}: JobListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<JobOptimizationResponse>({
        queryKey: ['jobs', { jobIds, skip, top, status }],

        enabled: jobIds.length > 0,

        queryFn: async () => {
            const { data } = await mAxios.get<JobOptimizationResponse>(
                process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs',
                {
                    params: {
                        jobIds,
                        skip,
                        top,
                        status
                    }
                }
            );

            return data;
        },

        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (prev) => prev
    });
};

export const useGetJobsByIds = ({
    jobIds = [],
    top = 15,
    page = 1
}: JobListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<JobOptimizationResponse>({
        queryKey: ['jobs', { jobIds, skip, top }],

        enabled: jobIds.length > 0,

        queryFn: async () => {
            const { data } = await mAxios.get<JobOptimizationResponse>(
                process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs',
                {
                    params: {
                        jobIds,
                        skip,
                        top
                    },
                    paramsSerializer: {
                        indexes: null // jobIds=a&jobIds=b
                    }
                }
            );

            return data;
        },

        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (prev) => prev
    });
};

// Job list
export interface ListFormValues {
    top: number;
    page: number;
    searchText?: string;
    status?: number | null;
    fromDate?: string;
    toDate?: string;
}

export interface JobListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: Job[];
}

export const useGetListJob = ({
    searchText = '',
    fromDate = '',
    toDate = '',
    top = 15,
    page = 1,
    status = null
}: ListFormValues) => {
    const skip = top * (page - 1);

    return useQuery<JobListResponse>({
        queryKey: [
            'jobs',
            'list',
            { skip, top, searchText, status, fromDate, toDate }
        ],
        queryFn: async () => {
            const res = await mAxios.get<ApiResponse<JobListResponse>>(
                process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs',
                { params: { skip, top, searchText, status, fromDate, toDate } }
            );

            return res.data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (previousData) => previousData
    });
};

export const useGetJobDetail = (id: string | null | undefined) => {
    return useQuery<Job>({
        queryKey: ['jobs', id],
        enabled: !!id,
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/${id}`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

export const useDispatchJobById = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (jobId: string) => {
            const { data } = await mAxios.post(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/${jobId}/dispatch`
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }
    });
};

export const useDispatchJobs = () => {
    return useMutation({
        mutationFn: async (payload: DispatchJobIdsPayload) => {
            const res = await mAxios.post(
                `${process.env.NEXT_PUBLIC_JOB_ENDPOINT ?? '/jobs'}/dispatch`,
                payload
            );

            return res.data;
        }
    });
};
