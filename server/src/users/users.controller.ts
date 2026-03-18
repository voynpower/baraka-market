// server/src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request, Param, Delete, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile, orders, and wishlist' })
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @Post('wishlist/:productId')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  toggleWishlist(@Request() req, @Param('productId') productId: string) {
    return this.usersService.toggleWishlist(req.user.userId, +productId);
  }

  @Patch('wishlist/sync')
  @ApiOperation({ summary: 'Sync local wishlist with server' })
  syncWishlist(@Request() req, @Body() data: { productIds: number[] }) {
    return this.usersService.syncWishlist(req.user.userId, data.productIds);
  }
}
