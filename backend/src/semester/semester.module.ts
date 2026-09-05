import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}