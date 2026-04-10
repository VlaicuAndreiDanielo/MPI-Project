import { IsUUID } from 'class-validator';

export class DeleteApplicationDto {
  @IsUUID()
  userId: string;
}
