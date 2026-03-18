import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
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
    updateStatus(id: string, status: string): Promise<{
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
