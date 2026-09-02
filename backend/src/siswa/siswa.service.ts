import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';

@Injectable()
export class SiswaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.siswa.findMany({
      include: {
        kelas: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id },
      include: {
        kelas: true,
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return siswa;
  }

  async create(dto: CreateSiswaDto) {
    const existing = await this.prisma.siswa.findUnique({
      where: {
        nis: dto.nis,
      },
    });

    if (existing) {
      throw new ConflictException('NIS sudah digunakan');
    }

    const kelas = await this.prisma.kelas.findUnique({
      where: {
        id: dto.kelasId,
      },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return this.prisma.siswa.create({
      data: {
        nis: dto.nis,
        nama: dto.nama,
        jk: dto.jk,
        kelasId: dto.kelasId,
      },
      include: {
        kelas: true,
      },
    });
  }

  async update(id: number, dto: UpdateSiswaDto) {
    await this.findOne(id);

    if (dto.nis) {
      const existing = await this.prisma.siswa.findFirst({
        where: {
          nis: dto.nis,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('NIS sudah digunakan');
      }
    }

    if (dto.kelasId) {
      const kelas = await this.prisma.kelas.findUnique({
        where: {
          id: dto.kelasId,
        },
      });

      if (!kelas) {
        throw new NotFoundException('Kelas tidak ditemukan');
      }
    }

    return this.prisma.siswa.update({
      where: { id },
      data: dto,
      include: {
        kelas: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.siswa.delete({
      where: { id },
    });
  }
}