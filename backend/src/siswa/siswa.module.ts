import { Module } from '@nestjs/common';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SiswaController],
  providers: [SiswaService],
})
export class SiswaModule {}