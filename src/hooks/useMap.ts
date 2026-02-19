import { ZoneProvince } from '@/app/dashboard/zone/(form)/zone.form.service';
import { mAxios } from '@/interceptors/axios.interceptor';
import { useQuery } from '@tanstack/react-query';

export interface District {
    id: number;
    name: string;
    provinceId: number;
    polygon?: GeoJSON.Feature[];
}

export interface ProvinceListResponse {
    totalPage?: number;
    totalCount?: number;
    nextLink?: string | null;
    prevLink?: string | null;
    value: ZoneProvince[];
}

export interface DistrictListResponse {
    totalPage?: number;
    totalCount?: number;
    nextLink?: string | null;
    prevLink?: string | null;
    value: ZoneProvince[];
}

export const useGetGeometryDetail = () => {
    return useQuery({
        queryKey: ['geometry'],
        queryFn: async () => {
            const res = await mAxios.get(`/geometry/`);
            return res.data.data;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useGetProvinces = () => {
    return useQuery<ProvinceListResponse>({
        queryKey: ['provinces'],
        queryFn: async () => {
            const res = await mAxios.get<ProvinceListResponse>(`/provinces/`);
            return res.data;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useGetProvincesDistrict = () => {
    return useQuery<DistrictListResponse>({
        queryKey: ['provinces-district'],
        queryFn: async () => {
            const res =
                await mAxios.get<DistrictListResponse>(`/provinces/district`);
            return res.data;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};
