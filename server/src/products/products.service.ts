// server/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        images: createProductDto.images ? JSON.stringify(createProductDto.images) : '[]',
        specs: createProductDto.specs ? JSON.stringify(createProductDto.specs) : '[]',
      },
    });
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating for each product
    return products.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length 
        : 0;
      return {
        ...p,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        // Remove reviews array from list to keep response light
        reviews: undefined 
      };
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
      : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        images: updateProductDto.images ? JSON.stringify(updateProductDto.images) : undefined,
        specs: updateProductDto.specs ? JSON.stringify(updateProductDto.specs) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(category: string) {
    const products = await this.prisma.product.findMany({
      where: { category },
      include: {
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length 
        : 0;
      return {
        ...p,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        reviews: undefined 
      };
    });
  }
}
