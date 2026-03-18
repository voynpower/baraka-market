// server/src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        wishlist: {
          select: { productId: true },
        },
      },
    });
  }

  async toggleWishlist(userId: number, productId: number) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return { wished: false };
    } else {
      await this.prisma.wishlistItem.create({
        data: { userId, productId },
      });
      return { wished: true };
    }
  }

  async syncWishlist(userId: number, productIds: number[]) {
    // Basic sync: add missing ones
    for (const pid of productIds) {
      await this.prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId: pid } },
        update: {},
        create: { userId, productId: pid },
      });
    }
    return this.getMe(userId);
  }
}
