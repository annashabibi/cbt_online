import { Module } from '@nestjs/common';
import { AkunSiswaController } from './akun-siswa.controller';
import { AkunSiswaService } from './akun-siswa.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AkunSiswaController],
  providers: [AkunSiswaService],
})
export class AkunSiswaModule {}