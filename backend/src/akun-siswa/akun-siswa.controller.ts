import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { AkunSiswaService } from './akun-siswa.service';

import { RegisterAkunSiswaDto } from './dto/register-akun-siswa.dto';
import { LoginAkunSiswaDto } from './dto/login-akun-siswa.dto';

@Controller('akun-siswa')
export class AkunSiswaController {
  constructor(
    private readonly akunSiswaService: AkunSiswaService,
  ) {}

  @Post('register')
  register(
    @Body() dto: RegisterAkunSiswaDto,
  ) {
    return this.akunSiswaService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginAkunSiswaDto,
  ) {
    return this.akunSiswaService.login(dto);
  }
}