import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteNoteDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
