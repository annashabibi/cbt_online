import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MataPelajaranService } from './mata-pelajaran.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mata-pelajaran')
@UseGuards(JwtAuthGuard)
export class MataPelajaranController {
  constructor(
    private readonly mataPelajaranService: MataPelajaranService,
  ) {}

  @Get()
  async findAll() {
    return this.mataPelajaranService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mataPelajaranService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      kode: string;
      nama: string;
    },
  ) {
    return this.mataPelajaranService.create({
      kode: body.kode,
      nama: body.nama,
    });
  }
}