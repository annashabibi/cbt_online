import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PenilaianService } from './penilaian.service';
import { NilaiEssayDto } from './dto/nilai-essay.dto';

@UseGuards(JwtAuthGuard)
@Controller('penilaian')
export class PenilaianController {
  constructor(
    private readonly penilaianService: PenilaianService,
  ) {}

  @Get('essay/belum-dinilai')
  getEssayBelumDinilai() {
    return this.penilaianService.getEssayBelumDinilai();
  }

  @Patch('jawaban/:id')
  nilaiEssay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NilaiEssayDto,
  ) {
    return this.penilaianService.nilaiEssay(id, dto);
  }
}