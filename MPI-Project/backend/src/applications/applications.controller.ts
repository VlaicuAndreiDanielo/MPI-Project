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
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { DeleteNoteDto } from './dto/delete-note.dto';

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
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() deleteApplicationDto: DeleteApplicationDto,
  ) {
    return this.applicationsService.remove(id, deleteApplicationDto.userId);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  addNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.applicationsService.addNote(id, createNoteDto);
  }

  @Get(':id/notes/user/:userId')
  @HttpCode(HttpStatus.OK)
  getNotesByApplication(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.applicationsService.getNotesByApplication(id, userId);
  }

  @Patch(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  updateNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.applicationsService.updateNote(id, noteId, updateNoteDto);
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  removeNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @Body() deleteNoteDto: DeleteNoteDto,
  ) {
    return this.applicationsService.removeNote(id, noteId, deleteNoteDto.userId);
  }
}