import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PesertaUjianController } from './peserta-ujian.controller';
import { PesertaUjianService } from './peserta-ujian.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PesertaUjianController],
  providers: [PesertaUjianService],
})
export class PesertaUjianModule {}