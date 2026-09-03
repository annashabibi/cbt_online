import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PesertaUjianService } from './peserta-ujian.service';
import { CreatePesertaUjianDto } from './dto/create-peserta-ujian.dto';

@UseGuards(JwtAuthGuard)
@Controller('peserta-ujian')
export class PesertaUjianController {
  constructor(
    private readonly pesertaUjianService: PesertaUjianService,
  ) {}

@Get()
findAll(@Request() req: any) {
  return this.pesertaUjianService.findForSiswa(
    req.user.siswaId,
  );
}

  @Get('saya')
  findSaya(@Request() req: any) {
    return this.pesertaUjianService.findForSiswa(
      req.user.siswaId,
    );
  }

  @Get('saya/:ulanganId')
  findSayaByUlangan(
    @Param('ulanganId', ParseIntPipe) ulanganId: number,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.findSayaByUlangan(
      req.user.siswaId,
      ulanganId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.findOne(
      id,
      req.user.siswaId,
    );
  }

  @Post()
  create(
    @Body() dto: CreatePesertaUjianDto,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.create(
      dto,
      req.user.siswaId,
    );
  }

  @Patch(':id/mulai')
  mulai(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.mulai(
      id,
      req.user.siswaId,
    );
  }

  @Patch(':id/selesai')
  selesai(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.selesai(
      id,
      req.user.siswaId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.pesertaUjianService.remove(
      id,
      req.user.siswaId,
    );
  }
}