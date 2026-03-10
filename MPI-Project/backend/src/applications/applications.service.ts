import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

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
}