import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let mailService: { sendOrderConfirmation: jest.Mock };

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      product: {
        count: jest.fn(),
      },
    };
    mailService = {
      sendOrderConfirmation: jest.fn(),
    };

    service = new OrdersService(prisma, mailService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an order, recalculates total, and sends confirmation', async () => {
    const createdOrder = {
      id: 12,
      totalAmount: 1998,
      user: { email: 'buyer@test.com' },
    };

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 1,
            name: 'iPhone 15 Pro',
            price: 999,
            stock: 5,
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        order: {
          create: jest.fn().mockResolvedValue(createdOrder),
        },
      };

      const result = await callback(tx);

      expect(tx.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { decrement: 2 } },
      });
      expect(tx.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 1998,
          items: [{ id: 1, name: 'iPhone 15 Pro', quantity: 2 }],
        }),
        include: { user: true },
      });

      return result;
    });

    const result = await service.create({
      customerName: 'Hasanboy',
      customerPhone: '+998901234567',
      customerAddress: 'Fargona city',
      totalAmount: 10,
      paymentMethod: 'cash',
      items: [{ id: 1, name: 'iPhone 15 Pro', quantity: 2 }],
      userId: 7,
    });

    expect(result).toBe(createdOrder);
    expect(mailService.sendOrderConfirmation).toHaveBeenCalledWith('buyer@test.com', createdOrder);
  });

  it('throws when order item quantity is invalid', async () => {
    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn(),
        },
      };

      return callback(tx);
    });

    await expect(
      service.create({
        customerName: 'Hasanboy',
        customerPhone: '+998901234567',
        customerAddress: 'Fargona city',
        totalAmount: 0,
        paymentMethod: 'cash',
        items: [{ id: 1, quantity: 0 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when order is missing during status update', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.updateStatus(999, 'completed')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns order details by id', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 25,
      customerName: 'Buyer',
      user: { id: 1, email: 'buyer@test.com', name: 'Buyer' },
    });

    const result = await service.findOne(25);

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 25 },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
    expect(result.id).toBe(25);
  });
});
