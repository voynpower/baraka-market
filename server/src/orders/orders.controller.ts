// server/src/orders/orders.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin only concept)' })
  findAll() {
    return this.ordersService.findAll();
  }
}
