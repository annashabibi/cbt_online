import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  findAll() {
    return this.pesertaUjianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pesertaUjianService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePesertaUjianDto) {
    return this.pesertaUjianService.create(dto);
  }

  @Patch(':id/mulai')
  mulai(@Param('id', ParseIntPipe) id: number) {
    return this.pesertaUjianService.mulai(id);
  }

  @Patch(':id/selesai')
  selesai(@Param('id', ParseIntPipe) id: number) {
    return this.pesertaUjianService.selesai(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pesertaUjianService.remove(id);
  }
}