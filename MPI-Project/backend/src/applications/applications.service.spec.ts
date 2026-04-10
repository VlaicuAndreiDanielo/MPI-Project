import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof jest.fn>;
    };
    jobApplication: {
      create: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      findMany: ReturnType<typeof jest.fn>;
      count: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
      delete: ReturnType<typeof jest.fn>;
    };
    applicationNote: {
      create: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      findMany: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
      delete: ReturnType<typeof jest.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      jobApplication: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      applicationNote: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new ApplicationsService(prisma as unknown as PrismaService);
  });

  it('should throw NotFoundException when creating an application for a missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        userId: 'user-1',
        companyName: 'Google',
        roleTitle: 'Backend Intern',
        status: ApplicationStatus.APPLIED,
        appliedAt: '2026-03-10T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should create an application when user exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.jobApplication.create.mockResolvedValue({
      id: 'app-1',
      userId: 'user-1',
      companyName: 'Google',
      roleTitle: 'Backend Intern',
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date('2026-03-10T12:00:00.000Z'),
    });

    const result = await service.create({
      userId: 'user-1',
      companyName: 'Google',
      roleTitle: 'Backend Intern',
      status: ApplicationStatus.APPLIED,
      appliedAt: '2026-03-10T12:00:00.000Z',
    });

    expect(prisma.jobApplication.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        companyName: 'Google',
        roleTitle: 'Backend Intern',
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date('2026-03-10T12:00:00.000Z'),
      },
    });

    expect(result).toEqual({
      message: 'Job application created successfully',
      application: {
        id: 'app-1',
        userId: 'user-1',
        companyName: 'Google',
        roleTitle: 'Backend Intern',
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date('2026-03-10T12:00:00.000Z'),
      },
    });
  });

  it('should return stats for a user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.jobApplication.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const result = await service.getStatsByUser('user-1');

    expect(result).toEqual({
      message: 'Dashboard statistics fetched successfully',
      stats: {
        total: 4,
        applied: 2,
        interview: 1,
        offer: 1,
        rejected: 0,
      },
    });
  });

  it('should throw ForbiddenException when updating another user application', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      userId: 'owner-1',
    });

    await expect(
      service.update('app-1', {
        userId: 'other-user',
        companyName: 'Amazon',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should delete an application when it belongs to the user', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      userId: 'user-1',
    });
    prisma.jobApplication.delete.mockResolvedValue({});

    const result = await service.remove('app-1', 'user-1');

    expect(prisma.jobApplication.delete).toHaveBeenCalledWith({
      where: { id: 'app-1' },
    });

    expect(result).toEqual({
      message: 'Application deleted successfully',
    });
  });

  it('should add a note when application belongs to the user', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      userId: 'user-1',
    });

    prisma.applicationNote.create.mockResolvedValue({
      id: 'note-1',
      applicationId: 'app-1',
      content: 'Am avut interviul tehnic.',
    });

    const result = await service.addNote('app-1', {
      userId: 'user-1',
      content: 'Am avut interviul tehnic.',
    });

    expect(prisma.applicationNote.create).toHaveBeenCalledWith({
      data: {
        applicationId: 'app-1',
        content: 'Am avut interviul tehnic.',
      },
    });

    expect(result).toEqual({
      message: 'Note added successfully',
      note: {
        id: 'note-1',
        applicationId: 'app-1',
        content: 'Am avut interviul tehnic.',
      },
    });
  });
});
