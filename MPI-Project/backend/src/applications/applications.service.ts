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
}