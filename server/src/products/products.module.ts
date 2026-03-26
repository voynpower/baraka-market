import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductUploadsService } from './product-uploads.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductUploadsService]
})
export class ProductsModule {}
