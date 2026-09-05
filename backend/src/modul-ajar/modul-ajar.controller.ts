import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ModulAjarService } from './modul-ajar.service';

@Controller('modul-ajar')
export class ModulAjarController {
  constructor(private readonly modulAjarService: ModulAjarService) {}

  @Get()
  findAll() {
    return this.modulAjarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulAjarService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.modulAjarService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.modulAjarService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulAjarService.remove(Number(id));
  }
}