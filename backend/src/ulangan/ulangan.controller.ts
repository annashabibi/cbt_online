import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UlanganService } from './ulangan.service';
import { CreateUlanganDto } from './dto/create-ulangan.dto';
import { UpdateUlanganDto } from './dto/update-ulangan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ulangan')
export class UlanganController {
  constructor(private readonly ulanganService: UlanganService) {}

@Get()
findAll() {
  return this.ulanganService.findAll();
}

@Get('saya')
findForSiswa(@Request() req: any) {
  return this.ulanganService.findForSiswa(
    req.user.siswaId,
  );
}

@Get(':id/progress')
getProgress(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.ulanganService.getProgress(id);
}

@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Request() req: any,
) {
  return this.ulanganService.findOne(
    id,
    req.user.siswaId,
  );
}

  @Post()
  create(@Body() dto: CreateUlanganDto) {
    return this.ulanganService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUlanganDto,
  ) {
    return this.ulanganService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ulanganService.remove(id);
  }
}