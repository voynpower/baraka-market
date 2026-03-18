import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(loginDto: Record<string, any>): Promise<{
        access_token: string;
        admin: {
            id: number;
            email: string;
            name: string | null;
        };
    }>;
    userRegister(data: Record<string, any>): Promise<{
        id: number;
        email: string;
        password: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    userLogin(loginDto: Record<string, any>): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string | null;
        };
    }>;
    setup(): Promise<{
        id: number;
        email: string;
        password: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
