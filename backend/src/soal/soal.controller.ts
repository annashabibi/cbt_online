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

import { SoalService } from './soal.service';
import { CreateSoalDto } from './dto/create-soal.dto';
import { UpdateSoalDto } from './dto/update-soal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('soal')
export class SoalController {
  constructor(private readonly soalService: SoalService) {}

  @Get()
  findAll() {
    return this.soalService.findAll();
  }

@Get('ulangan/:ulanganId')
@UseGuards(JwtAuthGuard)
findByUlangan(
  @Param('ulanganId', ParseIntPipe) ulanganId: number,
) {
  return this.soalService.findByUlangan(ulanganId);
}

@Get('ujian/:ulanganId')
findForSiswa(
  @Param('ulanganId', ParseIntPipe) ulanganId: number,
  @Request() req: any,
) {
  return this.soalService.findForSiswa(
    ulanganId,
    req.user.siswaId,
  );
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soalService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSoalDto) {
    return this.soalService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSoalDto,
  ) {
    return this.soalService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soalService.remove(id);
  }
}