import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginAkunSiswaDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}