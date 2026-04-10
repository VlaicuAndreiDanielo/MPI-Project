import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new AuthService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register a new user when email is not already used', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      fullName: 'Ana Popescu',
      email: 'ana@test.com',
      createdAt: new Date('2026-03-10T10:00:00.000Z'),
    });

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    const result = await service.register({
      fullName: 'Ana Popescu',
      email: 'ana@test.com',
      password: 'parola123',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ana@test.com' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('parola123', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        fullName: 'Ana Popescu',
        email: 'ana@test.com',
        passwordHash: 'hashed-password',
      },
    });

    expect(result).toEqual({
      message: 'User registered successfully',
      user: {
        id: 'user-1',
        fullName: 'Ana Popescu',
        email: 'ana@test.com',
        createdAt: new Date('2026-03-10T10:00:00.000Z'),
      },
    });
  });

  it('should throw ConflictException when email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        fullName: 'Ana Popescu',
        email: 'ana@test.com',
        password: 'parola123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should login successfully when credentials are valid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      fullName: 'Ana Popescu',
      email: 'ana@test.com',
      passwordHash: 'stored-hash',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      email: 'ana@test.com',
      password: 'parola123',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ana@test.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('parola123', 'stored-hash');

    expect(result).toEqual({
      message: 'Login successful',
      user: {
        id: 'user-1',
        fullName: 'Ana Popescu',
        email: 'ana@test.com',
      },
    });
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'ana@test.com',
        password: 'parola123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      fullName: 'Ana Popescu',
      email: 'ana@test.com',
      passwordHash: 'stored-hash',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'ana@test.com',
        password: 'gresita123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
