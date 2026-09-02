import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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

  @Get()
  findAll() {
    return this.hasilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hasilService.findOne(id);
  }

  @Post('hitung/:pesertaUjianId')
  hitungNilai(
    @Param('pesertaUjianId', ParseIntPipe)
    pesertaUjianId: number,
  ) {
    return this.hasilService.hitungNilai(
      pesertaUjianId,
    );
  }
}