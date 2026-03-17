import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(category?: string): Promise<{
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
    findOne(id: string): Promise<{
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
}
