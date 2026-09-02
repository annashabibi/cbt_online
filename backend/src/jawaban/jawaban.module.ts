import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JawabanController } from './jawaban.controller';
import { JawabanService } from './jawaban.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JawabanController],
  providers: [JawabanService],
})
export class JawabanModule {}