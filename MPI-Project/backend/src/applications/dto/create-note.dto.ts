import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}