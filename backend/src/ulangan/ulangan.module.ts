import { Module } from '@nestjs/common';

import { UlanganController } from './ulangan.controller';
import { UlanganService } from './ulangan.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UlanganController],
  providers: [UlanganService],
})
export class UlanganModule {}