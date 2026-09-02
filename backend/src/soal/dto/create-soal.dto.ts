import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSoalDto {
  @IsInt()
  ulanganId: number;

  @IsString()
  @IsIn(['PG', 'ESSAY'])
  tipe: string;

  @IsString()
  @IsNotEmpty()
  pertanyaan: string;

  @IsOptional()
  @IsString()
  gambar?: string;

  @IsInt()
  @Min(1)
  bobot: number;

  @IsOptional()
  @IsString()
  opsiA?: string;

  @IsOptional()
  @IsString()
  opsiB?: string;

  @IsOptional()
  @IsString()
  opsiC?: string;

  @IsOptional()
  @IsString()
  opsiD?: string;

  @IsOptional()
  @IsString()
  jawabanBenar?: string;
}