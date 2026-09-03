import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasilService } from './hasil.service';

@UseGuards(JwtAuthGuard)
@Controller('hasil')
export class HasilController {
  constructor(
    private readonly hasilService: HasilService,
  ) {}

  // =========================================================
  // GET SEMUA HASIL - ADMIN
  // =========================================================
  @Get()
  findAll() {
    return this.hasilService.findAll();
  }

  // =========================================================
  // GET HASIL MILIK SISWA
  // =========================================================
  @Get('saya')
  findSaya(@Request() req: any) {
    return this.hasilService.findAllForSiswa(
      req.user.siswaId,
    );
  }

  // =========================================================
  // GET DETAIL HASIL - ADMIN
  // =========================================================
  @Get('admin/:id')
  findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.hasilService.findOneAdmin(id);
  }

  // =========================================================
  // GET DETAIL HASIL - SISWA
  // =========================================================
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.hasilService.findOne(
      id,
      req.user.siswaId,
    );
  }

  // =========================================================
  // HITUNG NILAI
  // =========================================================
  @Post('hitung/:pesertaUjianId')
  hitungNilai(
    @Param('pesertaUjianId', ParseIntPipe)
    pesertaUjianId: number,
    @Request() req: any,
  ) {
    return this.hasilService.hitungNilai(
      pesertaUjianId,
      req.user.siswaId,
    );
  }
}