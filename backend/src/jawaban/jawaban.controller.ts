import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JawabanService } from './jawaban.service';
import { CreateJawabanDto } from './dto/create-jawaban.dto';

@UseGuards(JwtAuthGuard)
@Controller('jawaban')
export class JawabanController {
  constructor(private readonly jawabanService: JawabanService) {}

  @Get('peserta/:pesertaUjianId')
  findByPeserta(
    @Param('pesertaUjianId', ParseIntPipe) pesertaUjianId: number,
  ) {
    return this.jawabanService.findByPeserta(pesertaUjianId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jawabanService.findOne(id);
  }

  @Post()
  createOrUpdate(@Body() dto: CreateJawabanDto) {
    return this.jawabanService.createOrUpdate(dto);
  }
}