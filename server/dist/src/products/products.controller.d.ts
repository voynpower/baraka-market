import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
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
    }>;
    uploadFile(file: Express.Multer.File): {
        url: string;
    };
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
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
