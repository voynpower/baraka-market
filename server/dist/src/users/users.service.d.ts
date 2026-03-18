import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: number): Promise<{
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
    toggleWishlist(userId: number, productId: number): Promise<{
        wished: boolean;
    }>;
    syncWishlist(userId: number, productIds: number[]): Promise<{
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
