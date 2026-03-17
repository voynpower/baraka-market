import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        badgeClass: string | null;
        name: string;
        category: string;
        price: number;
        oldPrice: number | null;
        badge: string | null;
        mainImage: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        description: string;
        specs: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        badgeClass: string | null;
        name: string;
        category: string;
        price: number;
        oldPrice: number | null;
        badge: string | null;
        mainImage: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        description: string;
        specs: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null>;
    findByCategory(category: string): Promise<{
        badgeClass: string | null;
        name: string;
        category: string;
        price: number;
        oldPrice: number | null;
        badge: string | null;
        mainImage: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        description: string;
        specs: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
}
