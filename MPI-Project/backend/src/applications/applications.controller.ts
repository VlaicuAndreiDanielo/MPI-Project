import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  findAllByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.applicationsService.findAllByUser(userId);
  }

  @Get('user/:userId/status/:status')
  @HttpCode(HttpStatus.OK)
  findByUserAndStatus(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('status', new ParseEnumPipe(ApplicationStatus))
    status: ApplicationStatus,
  ) {
    return this.applicationsService.findByUserAndStatus(userId, status);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.applicationsService.remove(id);
  }
}