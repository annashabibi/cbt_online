import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';

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

  async findOne(id: number) {
    const kelas = await this.prisma.kelas.findUnique({
      where: { id },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return kelas;
  }

  async create(dto: CreateKelasDto) {
    const existing = await this.prisma.kelas.findUnique({
      where: {
        kode: dto.kode,
      },
    });

    if (existing) {
      throw new ConflictException('Kode kelas sudah digunakan');
    }

    return this.prisma.kelas.create({
      data: {
        kode: dto.kode,
        nama: dto.nama,
      },
    });
  }

  async update(id: number, dto: UpdateKelasDto) {
    await this.findOne(id);

    if (dto.kode) {
      const existing = await this.prisma.kelas.findFirst({
        where: {
          kode: dto.kode,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Kode kelas sudah digunakan');
      }
    }

    return this.prisma.kelas.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.kelas.delete({
      where: { id },
    });
  }
}