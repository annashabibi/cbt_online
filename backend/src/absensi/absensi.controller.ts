import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbsensiService } from './absensi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('absensi')
@UseGuards(JwtAuthGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  // GET /absensi/siswa?kelasId=1
  @Get('siswa')
  async getSiswaByKelas(
    @Query('kelasId', ParseIntPipe) kelasId: number,
  ) {
    return this.absensiService.getSiswaByKelas(kelasId);
  }

  // POST /absensi/pertemuan
  @Post('pertemuan')
  async createPertemuan(
    @Body()
    body: {
      kelasId: number;
      mataPelajaranId: number;
      semesterId: number;
      pertemuanKe: number;
      tanggal: string;
    },
  ) {
    return this.absensiService.createPertemuan({
      kelasId: Number(body.kelasId),
      mataPelajaranId: Number(body.mataPelajaranId),
      semesterId: Number(body.semesterId),
      pertemuanKe: Number(body.pertemuanKe),
      tanggal: new Date(body.tanggal),
    });
  }


  @Patch('pertemuan/:id')
async updatePertemuan(
  @Param('id', ParseIntPipe) id: number,
  @Body()
  body: {
    tanggal: string;
  },
) {
  return this.absensiService.updatePertemuan(id, {
    tanggal: new Date(body.tanggal),
  });
}


  // GET /absensi/pertemuan?kelasId=1&mataPelajaranId=1&semesterId=1
  @Get('pertemuan')
  async getPertemuan(
    @Query('kelasId', ParseIntPipe) kelasId: number,
    @Query('mataPelajaranId', ParseIntPipe) mataPelajaranId: number,
    @Query('semesterId', ParseIntPipe) semesterId: number,
  ) {
    return this.absensiService.getPertemuan({
      kelasId,
      mataPelajaranId,
      semesterId,
    });
  }

  // POST /absensi
  @Post()
  async simpanAbsensi(
    @Body()
    body: {
      absensiPertemuanId: number;
      siswaId: number;
      status: string | null;
    },
  ) {
    return this.absensiService.simpanAbsensi({
      absensiPertemuanId: Number(body.absensiPertemuanId),
      siswaId: Number(body.siswaId),
      status: body.status,
    });
  }

  // GET /absensi/pertemuan/:id
  @Get('pertemuan/:id')
  async getAbsensiPertemuan(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.absensiService.getAbsensiPertemuan(id);
  }

  // GET /absensi/rekap?kelasId=1&mataPelajaranId=1&semesterId=1
  @Get('rekap')
  async getRekapSiswa(
    @Query('kelasId', ParseIntPipe) kelasId: number,
    @Query('mataPelajaranId', ParseIntPipe) mataPelajaranId: number,
    @Query('semesterId', ParseIntPipe) semesterId: number,
  ) {
    return this.absensiService.getRekapSiswa({
      kelasId,
      mataPelajaranId,
      semesterId,
    });
  }
}