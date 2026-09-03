import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSoalDto } from './dto/create-soal.dto';
import { UpdateSoalDto } from './dto/update-soal.dto';

@Injectable()
export class SoalService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.soal.findMany({
      include: {
        ulangan: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByUlangan(ulanganId: number) {
    const ulangan = await this.prisma.ulangan.findUnique({
      where: { id: ulanganId },
    });

    if (!ulangan) {
      throw new NotFoundException('Ulangan tidak ditemukan');
    }

    return this.prisma.soal.findMany({
      where: {
        ulanganId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

async findForSiswa(
  ulanganId: number,
  siswaId: number,
) {
  const siswa = await this.prisma.siswa.findUnique({
    where: {
      id: siswaId,
    },
  });

  if (!siswa) {
    throw new NotFoundException(
      'Siswa tidak ditemukan',
    );
  }

  const ulangan = await this.prisma.ulangan.findFirst({
    where: {
      id: ulanganId,
      kelasId: siswa.kelasId,
      status: true,
    },
  });

  if (!ulangan) {
    throw new NotFoundException(
      'Ulangan tidak ditemukan',
    );
  }

  return this.prisma.soal.findMany({
    where: {
      ulanganId,
    },
    select: {
      id: true,
      tipe: true,
      pertanyaan: true,
      gambar: true,
      bobot: true,
      opsiA: true,
      opsiB: true,
      opsiC: true,
      opsiD: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
}

  async findOne(id: number) {
    const soal = await this.prisma.soal.findUnique({
      where: { id },
      include: {
        ulangan: true,
      },
    });

    if (!soal) {
      throw new NotFoundException('Soal tidak ditemukan');
    }

    return soal;
  }

  async create(dto: CreateSoalDto) {
    const ulangan = await this.prisma.ulangan.findUnique({
      where: {
        id: dto.ulanganId,
      },
    });

    if (!ulangan) {
      throw new NotFoundException('Ulangan tidak ditemukan');
    }

    this.validateSoal(dto);

    return this.prisma.soal.create({
      data: {
        ulanganId: dto.ulanganId,
        tipe: dto.tipe,
        pertanyaan: dto.pertanyaan,
        gambar: dto.gambar,
        bobot: dto.bobot,

        opsiA: dto.tipe === 'PG' ? dto.opsiA : null,
        opsiB: dto.tipe === 'PG' ? dto.opsiB : null,
        opsiC: dto.tipe === 'PG' ? dto.opsiC : null,
        opsiD: dto.tipe === 'PG' ? dto.opsiD : null,
        jawabanBenar:
          dto.tipe === 'PG' ? dto.jawabanBenar : null,
      },
      include: {
        ulangan: true,
      },
    });
  }

  async update(id: number, dto: UpdateSoalDto) {
    const existing = await this.prisma.soal.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Soal tidak ditemukan');
    }

    const ulanganId = dto.ulanganId ?? existing.ulanganId;
    const tipe = dto.tipe ?? existing.tipe;

    const ulangan = await this.prisma.ulangan.findUnique({
      where: {
        id: ulanganId,
      },
    });

    if (!ulangan) {
      throw new NotFoundException('Ulangan tidak ditemukan');
    }

    const mergedData = {
      tipe,
      pertanyaan: dto.pertanyaan ?? existing.pertanyaan,
      opsiA: dto.opsiA ?? existing.opsiA,
      opsiB: dto.opsiB ?? existing.opsiB,
      opsiC: dto.opsiC ?? existing.opsiC,
      opsiD: dto.opsiD ?? existing.opsiD,
      jawabanBenar:
        dto.jawabanBenar ?? existing.jawabanBenar,
    };

    this.validateSoal(mergedData);

    return this.prisma.soal.update({
      where: { id },
      data: {
        ...(dto.ulanganId !== undefined && {
          ulanganId: dto.ulanganId,
        }),

        ...(dto.tipe !== undefined && {
          tipe: dto.tipe,
        }),

        ...(dto.pertanyaan !== undefined && {
          pertanyaan: dto.pertanyaan,
        }),

        ...(dto.gambar !== undefined && {
          gambar: dto.gambar,
        }),

        ...(dto.bobot !== undefined && {
          bobot: dto.bobot,
        }),

        ...(tipe === 'PG'
          ? {
              opsiA: mergedData.opsiA,
              opsiB: mergedData.opsiB,
              opsiC: mergedData.opsiC,
              opsiD: mergedData.opsiD,
              jawabanBenar: mergedData.jawabanBenar,
            }
          : {
              opsiA: null,
              opsiB: null,
              opsiC: null,
              opsiD: null,
              jawabanBenar: null,
            }),
      },
      include: {
        ulangan: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.soal.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Soal tidak ditemukan');
    }

    await this.prisma.soal.delete({
      where: { id },
    });

    return {
      message: 'Soal berhasil dihapus',
    };
  }

  private validateSoal(data: {
    tipe: string;
    pertanyaan: string;
    opsiA?: string | null;
    opsiB?: string | null;
    opsiC?: string | null;
    opsiD?: string | null;
    jawabanBenar?: string | null;
  }) {
    if (!data.pertanyaan?.trim()) {
      throw new BadRequestException(
        'Pertanyaan wajib diisi',
      );
    }

    if (data.tipe === 'PG') {
      if (
        !data.opsiA?.trim() ||
        !data.opsiB?.trim() ||
        !data.opsiC?.trim() ||
        !data.opsiD?.trim()
      ) {
        throw new BadRequestException(
          'Soal PG wajib memiliki opsi A, B, C, dan D',
        );
      }

      if (
        !data.jawabanBenar ||
        !['A', 'B', 'C', 'D'].includes(
          data.jawabanBenar.toUpperCase(),
        )
      ) {
        throw new BadRequestException(
          'Jawaban benar harus A, B, C, atau D',
        );
      }
    }
  }
}