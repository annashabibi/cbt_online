import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateJawabanDto {
  @IsInt()
  pesertaUjianId: number;

  @IsInt()
  soalId: number;

  @IsOptional()
  @IsString()
  jawaban?: string;
}