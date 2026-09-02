import { Module } from '@nestjs/common';

import { SoalController } from './soal.controller';
import { SoalService } from './soal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SoalController],
  providers: [SoalService],
})
export class SoalModule {}