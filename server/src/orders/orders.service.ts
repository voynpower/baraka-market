// server/src/orders/orders.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const items = Array.isArray(createOrderDto.items) ? createOrderDto.items : JSON.parse(createOrderDto.items as string);
      let calculatedTotal = 0;
      
      for (const item of items) {
        if (!item?.id || !item?.quantity || item.quantity < 1) {
          throw new BadRequestException('Buyurtma mahsulotlari noto\'g\'ri formatda yuborildi');
        }

        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(`${product?.name || 'Mahsulot'} uchun yetarli zahira yo'q`);
        }
        calculatedTotal += product.price * item.quantity;
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          customerPhone: createOrderDto.customerPhone,
          customerAddress: createOrderDto.customerAddress,
          totalAmount: calculatedTotal,
          paymentMethod: createOrderDto.paymentMethod,
          items,
          userId: createOrderDto.userId,
        },
        include: { user: true }
      });
    });

    // Send Email Notification after successful order
    const targetEmail = order.user?.email || 'admin@barakamarket.uz'; // Default to admin if guest
    await this.mailService.sendOrderConfirmation(targetEmail, order);

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    return order;
  }

  async updateStatus(id: number, status: string) {
    const existingOrder = await this.prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async getStats() {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayOrders = await this.prisma.order.findMany({ where: { createdAt: { gte: startOfToday } } });
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

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
