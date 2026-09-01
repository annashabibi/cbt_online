import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KelasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kelas.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }
}