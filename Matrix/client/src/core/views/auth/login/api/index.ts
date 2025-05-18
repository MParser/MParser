import request from '@/http';
import type { LoginRequest, LoginResponse } from '../types';

export const loginHttp = (data: LoginRequest): Promise<LoginResponse> => request.post('/users/login', data, {
    headers: {
        'Content-Type': 'application/json'
    }
});
