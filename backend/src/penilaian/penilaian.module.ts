import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PenilaianController } from './penilaian.controller';
import { PenilaianService } from './penilaian.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PenilaianController],
  providers: [PenilaianService],
})
export class PenilaianModule {}