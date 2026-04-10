import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
