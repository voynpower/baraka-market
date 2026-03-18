// server/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    console.log(`🔑 Admin login attempt: ${email}`);
    
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log(`❌ Admin not found: ${email}`);
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'ADMIN' };
    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async userRegister(data: { email: string; pass: string; name?: string }) {
    const hashedPassword = await bcrypt.hash(data.pass, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });
  }

  async userLogin(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    const payload = { sub: user.id, email: user.email, role: 'USER' };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async setupAdmin() {
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    return this.prisma.admin.upsert({
      where: { email: 'admin@barakamarket.uz' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@barakamarket.uz',
        password: hashedPassword,
        name: 'VoynPower Admin',
      },
    });
  }
}
