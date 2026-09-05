import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MataPelajaranController } from './mata-pelajaran.controller';
import { MataPelajaranService } from './mata-pelajaran.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [MataPelajaranController],
  providers: [MataPelajaranService],
})
export class MataPelajaranModule {}