import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HasilController } from './hasil.controller';
import { HasilService } from './hasil.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HasilController],
  providers: [HasilService],
})
export class HasilModule {}