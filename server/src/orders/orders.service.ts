// server/src/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        customerAddress: createOrderDto.customerAddress,
        totalAmount: createOrderDto.totalAmount,
        paymentMethod: createOrderDto.paymentMethod,
        items: createOrderDto.items,
      },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
