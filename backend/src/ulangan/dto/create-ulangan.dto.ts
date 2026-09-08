import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateUlanganDto {
  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsInt()
  kelasIds: number[];

  @IsDateString()
  tanggal: string;

  @IsInt()
  @Min(1)
  durasi: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}