import { Module } from '@nestjs/common';
import { ModulAjarController } from './modul-ajar.controller';
import { ModulAjarService } from './modul-ajar.service';

@Module({
  controllers: [ModulAjarController],
  providers: [ModulAjarService]
})
export class ModulAjarModule {}
