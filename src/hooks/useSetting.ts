import { mAxios } from '@/interceptors/axios.interceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface SettingResponse {
    RequireDriverPod: boolean;
}

export const useGetSetting = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await mAxios.get(
                `${process.env.NEXT_PUBLIC_SETTING_ENDPOINT ?? '/settings'}/current`
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });
};

export const useUpdateSettingStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            requireDriverPod
        }: {
            id: string;
            requireDriverPod: boolean;
        }) => {
            const { data } = await mAxios.put(
                `${process.env.NEXT_PUBLIC_SETTING_ENDPOINT ?? '/settings'}/${id}`,
                {
                    settings: {
                        RequireDriverPod: String(requireDriverPod)
                    }
                }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });
};
