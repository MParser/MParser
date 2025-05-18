import { getToken } from '../../utils/token';
import type { InternalAxiosRequestConfig } from 'axios';

export default (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    return config;
};
