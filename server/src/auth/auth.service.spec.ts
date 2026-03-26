import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    admin: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock; create: jest.Mock };
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(() => {
    prisma = {
      admin: { findUnique: jest.fn() },
      user: { findUnique: jest.fn(), create: jest.fn() },
    };
    jwtService = { signAsync: jest.fn() };
    service = new AuthService(prisma as any, jwtService as JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns admin token and profile on successful login', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@barakamarket.uz',
      password: 'hashed-password',
      name: 'Admin',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-jwt');

    const result = await service.login('admin@barakamarket.uz', 'admin1234');

    expect(prisma.admin.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@barakamarket.uz' },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'admin@barakamarket.uz',
      role: 'ADMIN',
    });
    expect(result).toEqual({
      access_token: 'signed-jwt',
      admin: { id: 1, email: 'admin@barakamarket.uz', name: 'Admin' },
    });
  });

  it('throws on duplicate user registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'user@test.com' });

    await expect(
      service.userRegister({ email: 'user@test.com', pass: 'password123', name: 'User' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a new user with hashed password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    prisma.user.create.mockResolvedValue({
      id: 3,
      email: 'user@test.com',
      password: 'hashed-password',
      name: 'User',
    });

    const result = await service.userRegister({
      email: 'user@test.com',
      pass: 'password123',
      name: 'User',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'user@test.com',
        password: 'hashed-password',
        name: 'User',
      },
    });
    expect(result.email).toBe('user@test.com');
  });

  it('throws when user password does not match', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 4,
      email: 'user@test.com',
      password: 'hashed-password',
      name: 'User',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.userLogin('user@test.com', 'wrong-pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
