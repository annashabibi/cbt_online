import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateUlanganDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  judul?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsInt()
  kelasIds: number[];

  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durasi?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}