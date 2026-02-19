import axios, { AxiosInstance } from 'axios';

export let mAxios: AxiosInstance;
export const getAxios = () => {
    if (mAxios) return mAxios;
    else {
        const newAxios = axios.create({
            baseURL: '/api/proxy'
        });
        // newAxios.interceptors.request.use(ApiTokenInterceptor);
        newAxios.interceptors.response.use(
            (res) => res,
            (error) => {
                const status = error?.response?.status;
                const isDev = process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true';

                // If we are in development, we log the error instead of kicking the user out
                if (isDev) {
                    console.warn(
                        `[Axios Interceptor] Blocked redirect for status ${status} in development mode.`
                    );
                    return Promise.reject(error);
                }

                switch (status) {
                    case 401:
                        window.location.href = '/no-access';
                        break;
                    case 403:
                        window.location.href = '/no-permission';
                        break;
                    case 404:
                        window.location.href = '/not-found';
                        break;
                }

                return Promise.reject(error);
            }
        );
        mAxios = newAxios;
        return mAxios;
    }
};
