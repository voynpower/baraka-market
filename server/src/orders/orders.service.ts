// server/src/orders/orders.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Process items and update stock
      const items = Array.isArray(createOrderDto.items) ? createOrderDto.items : JSON.parse(createOrderDto.items);
      
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          console.error(`[ORDER ERROR] Product not found: ID ${item.id}`);
          throw new BadRequestException(`Mahsulot topilmadi: ID ${item.id}`);
        }

        if (product.stock < item.quantity) {
          console.warn(`[ORDER ERROR] Out of stock: ${product.name} (Available: ${product.stock}, Requested: ${item.quantity})`);
          throw new BadRequestException(`${product.name} uchun yetarli zahira yo'q (Mavjud: ${product.stock})`);
        }

        // 2. Reduce Stock
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Create Order
      return tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          customerPhone: createOrderDto.customerPhone,
          customerAddress: createOrderDto.customerAddress,
          totalAmount: createOrderDto.totalAmount,
          paymentMethod: createOrderDto.paymentMethod,
          items: createOrderDto.items,
          userId: createOrderDto.userId,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async getStats() {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Today's stats
      const todayOrders = await this.prisma.order.findMany({
        where: { createdAt: { gte: startOfToday } },
      });
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      // 2. Weekly trend
      const last7DaysOrders = await this.prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      });

      const dailyTrend = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyTrend[key] = 0;
      }

      last7DaysOrders.forEach(o => {
        const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dailyTrend[key] !== undefined) dailyTrend[key] += o.totalAmount;
      });

      const totalOrdersCount = await this.prisma.order.count();
      const totalProductsCount = await this.prisma.product.count();

      return {
        todayRevenue: todayRevenue || 0,
        todayOrdersCount: todayOrders.length || 0,
        totalOrdersCount: totalOrdersCount || 0,
        totalProductsCount: totalProductsCount || 0,
        chartData: Object.entries(dailyTrend).map(([date, value]) => ({ date, value })),
      };
    } catch (error) {
      console.error('[STATS ERROR]', error);
      throw error;
    }
  }
}
