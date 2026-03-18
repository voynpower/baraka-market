// server/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async signIn(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('user/register')
  @ApiOperation({ summary: 'User registration' })
  async userRegister(@Body() data: Record<string, any>) {
    return this.authService.userRegister({
      email: data.email,
      pass: data.password,
      name: data.name
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('user/login')
  @ApiOperation({ summary: 'User login' })
  async userLogin(@Body() loginDto: Record<string, any>) {
    return this.authService.userLogin(loginDto.email, loginDto.password);
  }

  @Get('setup')
  @ApiOperation({ summary: 'Emergency Admin Setup (Testing Only)' })
  async setup() {
    return this.authService.setupAdmin();
  }
}
