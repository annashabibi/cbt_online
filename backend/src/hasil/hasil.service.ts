import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HasilService {
  constructor(private readonly prisma: PrismaService) {}

  async hitungNilai(pesertaUjianId: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id: pesertaUjianId },
      include: {
        jawaban: {
          include: {
            soal: true,
          },
        },
      },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (peserta.status !== 'SELESAI') {
      throw new BadRequestException(
        'Ujian belum selesai',
      );
    }

    // Pastikan semua Essay sudah dinilai
    const essayBelumDinilai = peserta.jawaban.some(
      (jawaban) =>
        jawaban.soal.tipe === 'ESSAY' &&
        !jawaban.dinilai,
    );

    if (essayBelumDinilai) {
      throw new BadRequestException(
        'Masih ada jawaban Essay yang belum dinilai',
      );
    }

    let nilaiPG = 0;
    let nilaiEssay = 0;
    let totalBobot = 0;
    let totalNilai = 0;

    for (const jawaban of peserta.jawaban) {
      totalBobot += jawaban.soal.bobot;
      totalNilai += jawaban.nilai;

      if (jawaban.soal.tipe === 'PG') {
        nilaiPG += jawaban.nilai;
      }

      if (jawaban.soal.tipe === 'ESSAY') {
        nilaiEssay += jawaban.nilai;
      }
    }

    const nilaiAkhir =
      totalBobot > 0
        ? (totalNilai / totalBobot) * 100
        : 0;

    return this.prisma.hasilUjian.upsert({
      where: {
        pesertaUjianId,
      },
      update: {
        nilaiPG,
        nilaiEssay,
        nilaiAkhir,
        status: 'FINAL',
      },
      create: {
        pesertaUjianId,
        nilaiPG,
        nilaiEssay,
        nilaiAkhir,
        status: 'FINAL',
      },
      include: {
        pesertaUjian: {
          include: {
            siswa: {
              include: {
                kelas: true,
              },
            },
            ulangan: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.hasilUjian.findMany({
      include: {
        pesertaUjian: {
          include: {
            siswa: {
              include: {
                kelas: true,
              },
            },
            ulangan: true,
          },
        },
      },
      orderBy: {
        nilaiAkhir: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const hasil = await this.prisma.hasilUjian.findUnique({
      where: { id },
      include: {
        pesertaUjian: {
          include: {
            siswa: {
              include: {
                kelas: true,
              },
            },
            ulangan: true,
            jawaban: {
              include: {
                soal: true,
              },
            },
          },
        },
      },
    });

    if (!hasil) {
      throw new NotFoundException(
        'Hasil ujian tidak ditemukan',
      );
    }

    return hasil;
  }
}