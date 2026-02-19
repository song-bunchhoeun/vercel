import { UserResponseData } from '@/app/dashboard/user/(form)/user.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---

export interface ListFormValues {
    top: number;
    page: number;
    searchText?: string;
    roleId?: number | null;
    fromDate?: string;
    toDate?: string;
}

export interface UserListResponse {
    totalPage: number;
    totalCount: number;
    nextLink: string | null;
    prevLink: string | null;
    value: UserResponseData[];
}

interface UpdateUserParams {
    id: string;
    payload: FormData;
}

// --- Queries ---

export const useGetListUsers = (params: ListFormValues) => {
    const {
        searchText = '',
        fromDate = '',
        toDate = '',
        top = 15,
        page = 1,
        roleId = null
    } = params;

    const skip = top * (page - 1);

    return useQuery<UserListResponse>({
        queryKey: [
            'users',
            'list',
            { skip, top, searchText, roleId, fromDate, toDate }
        ],
        queryFn: async () => {
            const { data } = await mAxios.get<UserListResponse>(
                process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users',
                { params: { skip, top, searchText, roleId, fromDate, toDate } }
            );
            return data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useGetUserDetail = (id: string | null | undefined) => {
    return useQuery<UserResponseData>({
        queryKey: ['users', id],
        enabled: !!id,
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users'}/${id}`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};

export const useGetUserProfile = () => {
    return useQuery({
        queryKey: ['users', 'profile'],
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users'}/profile`
            );
            return data.data;
        },
        staleTime: 10 * 60 * 1000, // Profile data is usually very stable
        refetchOnWindowFocus: false
    });
};

// --- Mutations ---

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await mAxios.post(
                process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users',
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: () => {
            // Broad invalidation ensures the list and any detail views are updated
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: UpdateUserParams) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users'}/${id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            // Specific invalidation for the edited user's cache
            queryClient.invalidateQueries({
                queryKey: ['users', variables.id]
            });
        }
    });
};

export const useUpdateUserStatus = (id?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: number) => {
            const { data } = await mAxios.patch(
                `${process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users'}/${id}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['users', id] });
            }
        }
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_USER_ENDPOINT ?? '/users'}/profile`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};
