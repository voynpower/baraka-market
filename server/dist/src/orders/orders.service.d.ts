import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        status: string;
    }>;
    findAll(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        totalAmount: number;
        paymentMethod: string;
        status: string;
    }[]>;
}
