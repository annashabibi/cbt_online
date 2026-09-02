import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSiswaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nis: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama: string;

  @IsString()
  @IsNotEmpty()
  jk: string;

  @IsNotEmpty()
  kelasId: number;
}