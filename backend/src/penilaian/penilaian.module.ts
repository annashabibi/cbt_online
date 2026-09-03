import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PenilaianController } from './penilaian.controller';
import { PenilaianService } from './penilaian.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'development-secret',
    }),
  ],
  controllers: [PenilaianController],
  providers: [PenilaianService],
})
export class PenilaianModule {}