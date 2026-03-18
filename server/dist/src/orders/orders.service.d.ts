import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number | null;
    }>;
    findAll(): Promise<{
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number | null;
    }[]>;
    updateStatus(id: number, status: string): Promise<{
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number | null;
    }>;
}
