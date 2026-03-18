import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        id: number;
        email: string;
        name: string | null;
        orders: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            items: import("@prisma/client/runtime/library").JsonValue;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
            totalAmount: number;
            paymentMethod: string;
            userId: number | null;
            status: string;
        }[];
        wishlist: {
            productId: number;
        }[];
    } | null>;
    toggleWishlist(req: any, productId: string): Promise<{
        wished: boolean;
    }>;
    syncWishlist(req: any, data: {
        productIds: number[];
    }): Promise<{
        id: number;
        email: string;
        name: string | null;
        orders: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            items: import("@prisma/client/runtime/library").JsonValue;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
            totalAmount: number;
            paymentMethod: string;
            userId: number | null;
            status: string;
        }[];
        wishlist: {
            productId: number;
        }[];
    } | null>;
}
