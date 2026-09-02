import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterAkunSiswaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nis: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}