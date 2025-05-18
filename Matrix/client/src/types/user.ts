import type { Department } from './department';

export interface User {
    id: number;
    username: string;
    email: string;
    phone: string;
    avatar: string;
    department: Department;
    authority: string[];
    register_time: string;
};
