import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const { userId, companyName, roleTitle, status, appliedAt } =
      createApplicationDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const application = await this.prisma.jobApplication.create({
      data: {
        userId,
        companyName,
        roleTitle,
        status,
        appliedAt: new Date(appliedAt),
      },
    });

    return {
      message: 'Job application created successfully',
      application,
    };
  }

  async findAllByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const applications = await this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return {
      message: 'Applications fetched successfully',
      applications,
    };
  }

async findByUserAndStatus(userId: string, status: ApplicationStatus) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const applications = await this.prisma.jobApplication.findMany({
    where: {
      userId,
      status,
    },
    orderBy: {
      appliedAt: 'desc',
    },
  });

  return {
    message: 'Filtered applications fetched successfully',
    applications,
  };
}
async getStatsByUser(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const total = await this.prisma.jobApplication.count({
    where: { userId },
  });

  const applied = await this.prisma.jobApplication.count({
    where: { userId, status: ApplicationStatus.APPLIED },
  });

  const interview = await this.prisma.jobApplication.count({
    where: { userId, status: ApplicationStatus.INTERVIEW },
  });

  const offer = await this.prisma.jobApplication.count({
    where: { userId, status: ApplicationStatus.OFFER },
  });

  const rejected = await this.prisma.jobApplication.count({
    where: { userId, status: ApplicationStatus.REJECTED },
  });

  return {
    message: 'Dashboard statistics fetched successfully',
    stats: {
      total,
      applied,
      interview,
      offer,
      rejected,
    },
  };
}
  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    if (existingApplication.userId !== updateApplicationDto.userId) {
      throw new ForbiddenException('You can edit only your own applications');
    }

    const application = await this.prisma.jobApplication.update({
      where: { id },
      data: {
        companyName: updateApplicationDto.companyName,
        roleTitle: updateApplicationDto.roleTitle,
        status: updateApplicationDto.status,
        appliedAt: updateApplicationDto.appliedAt
          ? new Date(updateApplicationDto.appliedAt)
          : undefined,
      },
    });

    return {
      message: 'Application updated successfully',
      application,
    };
  }

  async remove(id: string, userId: string) {
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    if (existingApplication.userId !== userId) {
      throw new ForbiddenException('You can delete only your own applications');
    }

    await this.prisma.jobApplication.delete({
      where: { id },
    });

    return {
      message: 'Application deleted successfully',
    };
  }
  async addNote(id: string, createNoteDto: CreateNoteDto) {
  const existingApplication = await this.prisma.jobApplication.findUnique({
    where: { id },
  });

  if (!existingApplication) {
    throw new NotFoundException('Application not found');
  }

  if (existingApplication.userId !== createNoteDto.userId) {
    throw new ForbiddenException('You can edit only your own applications');
  }

  const note = await this.prisma.applicationNote.create({
    data: {
      applicationId: id,
      content: createNoteDto.content,
    },
  });

  return {
    message: 'Note added successfully',
    note,
  };
}
}