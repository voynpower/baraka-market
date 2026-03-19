import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
        id: number;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
    }>;
    findAll(): Promise<{
        id: number;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
    }[]>;
    updateStatus(id: number, status: string): Promise<{
        id: number;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
    }>;
    getStats(): Promise<{
        todayRevenue: number;
        todayOrdersCount: number;
        totalOrdersCount: number;
        totalProductsCount: number;
        chartData: {
            date: string;
            value: unknown;
        }[];
    }>;
}
