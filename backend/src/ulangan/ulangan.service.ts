import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUlanganDto } from './dto/create-ulangan.dto';
import { UpdateUlanganDto } from './dto/update-ulangan.dto';

@Injectable()
export class UlanganService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ulangan.findMany({
      include: {
        kelas: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findForSiswa(siswaId: number) {
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        id: siswaId,
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return this.prisma.ulangan.findMany({
      where: {
        kelasId: siswa.kelasId,
        status: true,
      },
      include: {
        kelas: true,
        soal: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        tanggal: 'asc',
      },
    });
  }

async findOne(id: number) {
  const ulangan = await this.prisma.ulangan.findUnique({
    where: { id },
    include: {
      kelas: true,
      soal: {
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  if (!ulangan) {
    throw new NotFoundException('Ulangan tidak ditemukan');
  }

  return ulangan;
}
  async create(dto: CreateUlanganDto) {
    const kelas = await this.prisma.kelas.findUnique({
      where: {
        id: dto.kelasId,
      },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const existing = await this.prisma.ulangan.findUnique({
      where: {
        kode: dto.kode,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Kode ulangan sudah digunakan',
      );
    }

    return this.prisma.ulangan.create({
      data: {
        kode: dto.kode,
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        kelasId: dto.kelasId,
        tanggal: new Date(dto.tanggal),
        durasi: dto.durasi,
        status: dto.status ?? true,
      },
      include: {
        kelas: true,
      },
    });
  }

  async update(id: number, dto: UpdateUlanganDto) {
    const existing = await this.prisma.ulangan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    if (dto.kelasId !== undefined) {
      const kelas = await this.prisma.kelas.findUnique({
        where: {
          id: dto.kelasId,
        },
      });

      if (!kelas) {
        throw new NotFoundException(
          'Kelas tidak ditemukan',
        );
      }
    }

    if (dto.kode && dto.kode !== existing.kode) {
      const kodeExists =
        await this.prisma.ulangan.findUnique({
          where: {
            kode: dto.kode,
          },
        });

      if (kodeExists) {
        throw new ConflictException(
          'Kode ulangan sudah digunakan',
        );
      }
    }

    return this.prisma.ulangan.update({
      where: { id },
      data: {
        ...(dto.kode !== undefined && {
          kode: dto.kode,
        }),

        ...(dto.judul !== undefined && {
          judul: dto.judul,
        }),

        ...(dto.deskripsi !== undefined && {
          deskripsi: dto.deskripsi,
        }),

        ...(dto.kelasId !== undefined && {
          kelasId: dto.kelasId,
        }),

        ...(dto.tanggal !== undefined && {
          tanggal: new Date(dto.tanggal),
        }),

        ...(dto.durasi !== undefined && {
          durasi: dto.durasi,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),
      },
      include: {
        kelas: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.ulangan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    await this.prisma.ulangan.delete({
      where: { id },
    });

    return {
      message: 'Ulangan berhasil dihapus',
    };
  }
}