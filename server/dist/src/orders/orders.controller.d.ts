import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
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
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
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
}
