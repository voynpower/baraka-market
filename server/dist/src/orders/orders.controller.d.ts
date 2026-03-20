import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
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
    }[]>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
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
    }>;
}
