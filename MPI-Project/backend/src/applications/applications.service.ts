import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { CreateNoteDto } from './dto/create-note.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

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

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
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

  async remove(id: string) {
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
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