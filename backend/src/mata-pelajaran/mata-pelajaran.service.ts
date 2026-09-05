import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MataPelajaranService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mataPelajaran.findMany({
      orderBy: {
        nama: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.mataPelajaran.findUnique({
      where: { id },
    });
  }

  async create(data: {
    kode: string;
    nama: string;
  }) {
    return this.prisma.mataPelajaran.create({
      data: {
        kode: data.kode,
        nama: data.nama,
      },
    });
  }
}