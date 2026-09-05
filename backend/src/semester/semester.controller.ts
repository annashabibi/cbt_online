import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('semester')
@UseGuards(JwtAuthGuard)
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
  ) {}

  @Get()
  async findAll() {
    return this.semesterService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.semesterService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      tahunAjaran: string;
      semester: string;
    },
  ) {
    return this.semesterService.create({
      tahunAjaran: body.tahunAjaran,
      semester: body.semester,
    });
  }
}