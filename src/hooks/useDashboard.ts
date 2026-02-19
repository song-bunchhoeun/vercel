import { mAxios } from '@/interceptors/axios.interceptor';
import { BaseResponse } from '@/models/response.model';
import { useQuery } from '@tanstack/react-query';

export interface SummaryCardList {
    dateDescrption: string;
    ordersByPeriod: {
        value: number;
        growth: {
            percentage: number;
            isUp: boolean;
        };
    };
    newCustomerByPeriod: {
        value: number;
        growth: {
            percentage: number;
            isUp: boolean;
        };
    };
    allOrders: {
        value: number;
        growth: string | null;
    };
    allCustomers: {
        value: number;
        growth: string | null;
    };
}

export interface RankingList {
    topDrivers: {
        rank: number;
        driverName: string;
        totalOrders: number;
    }[];
    topCustomers: {
        customerName: string;
        phoneNumber: string;
        totalOrders: number;
    }[];
}

export interface SummaryCardValues {
    warehouseIds?: string[] | null;
    fromDate?: string;
    toDate?: string;
}

export interface RankingValues {
    warehouseIds?: string[] | null;
    driverRank?: string;
    customerRank?: string;
    fromDate?: string;
    toDate?: string;
}

export type SummaryCardResponseBody = BaseResponse<SummaryCardList>;
export type RankingResponseBody = BaseResponse<RankingList>;

export const useDashboardSummaryCardList = (params: SummaryCardValues) => {
    const { fromDate, toDate, warehouseIds } = params;

    // Only fetch if dates are provided or explicitly handled
    const isEnabled = !!fromDate && !!toDate;

    return useQuery<SummaryCardList>({
        queryKey: ['summary-card', 'list', { warehouseIds, fromDate, toDate }],
        enabled: isEnabled,
        queryFn: async () => {
            const { data } = await mAxios.get<BaseResponse<SummaryCardList>>(
                `${process.env.NEXT_PUBLIC_DASHBOARD_ENDPOINT ?? '/dashboard'}/summary-card`,
                {
                    params: {
                        warehouseIds,
                        fromDate,
                        toDate
                    },
                    paramsSerializer: (params) => {
                        const searchParams = new URLSearchParams();
                        Object.keys(params).forEach((key) => {
                            const value = params[key];
                            if (Array.isArray(value)) {
                                value.forEach((v) =>
                                    searchParams.append(key, v)
                                );
                            } else if (
                                value !== undefined &&
                                value !== null &&
                                value !== ''
                            ) {
                                searchParams.append(key, value as string);
                            }
                        });
                        return searchParams.toString();
                    }
                }
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useDashboardRankingList = (params: RankingValues) => {
    const {
        fromDate,
        toDate,
        warehouseIds,
        driverRank = '5',
        customerRank = '5'
    } = params;

    const isEnabled = !!fromDate && !!toDate;

    return useQuery<RankingList>({
        queryKey: [
            'ranking',
            'list',
            { warehouseIds, driverRank, customerRank, fromDate, toDate }
        ],
        enabled: isEnabled,
        queryFn: async () => {
            const { data } = await mAxios.get<BaseResponse<RankingList>>(
                `${process.env.NEXT_PUBLIC_DASHBOARD_ENDPOINT ?? '/dashboard'}/ranking`,
                {
                    params: {
                        warehouseIds,
                        driverRank,
                        customerRank,
                        fromDate,
                        toDate
                    },
                    paramsSerializer: (params) => {
                        const searchParams = new URLSearchParams();
                        Object.keys(params).forEach((key) => {
                            const value = params[key];
                            if (Array.isArray(value)) {
                                value.forEach((v) =>
                                    searchParams.append(key, v)
                                );
                            } else if (
                                value !== undefined &&
                                value !== null &&
                                value !== ''
                            ) {
                                searchParams.append(key, value as string);
                            }
                        });
                        return searchParams.toString();
                    }
                }
            );
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

export interface PayloadProps {
    fromDate?: string;
    toDate?: string;
}

interface SeriesProps {
    zone: string;
    delivered: number;
    failed: number;
}

interface OrderZoneResponseData {
    legend: string[];
    series: SeriesProps[];
}

export const useGetOrderByZone = ({ fromDate, toDate }: PayloadProps) => {
    return useQuery<ApiResponse<OrderZoneResponseData>>({
        queryKey: ['order-by-zone', fromDate, toDate],
        queryFn: async () => {
            const res = await mAxios.get<ApiResponse<OrderZoneResponseData>>(
                `${process.env.NEXT_PUBLIC_DASHBOARD_ENDPOINT ?? '/dashboard'}/order-by-zone?api-version=2025-10-13&fromDate=${fromDate}&toDate=${toDate}`
            );

            return {
                ...res.data,
                data: {
                    legend: res.data.data.legend ?? [],
                    series: res.data.data.series ?? []
                }
            };
        },
        enabled: !!fromDate && !!toDate
    });
};

interface HeatmapPoint {
    lat: number;
    lng: number;
}

export const useGetHeatmapData = ({ fromDate, toDate }: PayloadProps) => {
    return useQuery<ApiResponse<HeatmapPoint[]>>({
        queryKey: ['order-heatmap', fromDate, toDate],
        queryFn: async () => {
            const res = await mAxios.get<ApiResponse<HeatmapPoint[]>>(
                `${process.env.NEXT_PUBLIC_DASHBOARD_ENDPOINT ?? '/dashboard'}/order-heatmap?api-version=2025-10-13&fromDate=${fromDate}&toDate=${toDate}`
            );

            return res.data;
        },
        enabled: !!fromDate && !!toDate
    });
};
