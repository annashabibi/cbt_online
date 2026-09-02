import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateKelasDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama: string;
}