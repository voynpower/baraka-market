import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
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
