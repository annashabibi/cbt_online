import { IsInt } from 'class-validator';

export class CreatePesertaUjianDto {
  @IsInt()
  ulanganId: number;

  @IsInt()
  siswaId: number;
}