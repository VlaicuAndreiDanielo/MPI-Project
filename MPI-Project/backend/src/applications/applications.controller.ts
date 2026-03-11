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
import { CreateNoteDto } from './dto/create-note.dto';

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

  @Get('user/:userId/stats')
  @HttpCode(HttpStatus.OK)
  getStatsByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.applicationsService.getStatsByUser(userId);
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

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  addNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.applicationsService.addNote(id, createNoteDto);
  }
}