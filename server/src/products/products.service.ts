// server/src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.product.findMany({
      where: { category },
    });
  }
}
