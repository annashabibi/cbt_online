import { Controller, Get } from '@nestjs/common';
import { KelasService } from './kelas.service';

@Controller('kelas')
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Get()
  findAll() {
    return this.kelasService.findAll();
  }
}