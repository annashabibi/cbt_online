import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AbsensiController } from './absensi.controller';
import { AbsensiService } from './absensi.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AbsensiController],
  providers: [AbsensiService],
})
export class AbsensiModule {}