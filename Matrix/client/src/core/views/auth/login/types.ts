export interface LoginForm {
    email: string;
    password: string;
};

export interface LoginRequest {
    username: string;
    password: string;
};

export interface LoginResponse {
    user: User;
};
