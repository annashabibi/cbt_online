import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JawabanService } from './jawaban.service';
import { CreateJawabanDto } from './dto/create-jawaban.dto';

@UseGuards(JwtAuthGuard)
@Controller('jawaban')
export class JawabanController {
  constructor(
    private readonly jawabanService: JawabanService,
  ) {}

  @Get('peserta/:pesertaUjianId')
  findByPeserta(
    @Param('pesertaUjianId', ParseIntPipe) pesertaUjianId: number,
    @Request() req: any,
  ) {
    return this.jawabanService.findByPeserta(
      pesertaUjianId,
      req.user.siswaId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.jawabanService.findOne(
      id,
      req.user.siswaId,
    );
  }

  @Post()
  createOrUpdate(
    @Body() dto: CreateJawabanDto,
    @Request() req: any,
  ) {
    return this.jawabanService.createOrUpdate(
      dto,
      req.user.siswaId,
    );
  }
}