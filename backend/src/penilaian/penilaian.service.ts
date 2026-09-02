import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NilaiEssayDto } from './dto/nilai-essay.dto';

@Injectable()
export class PenilaianService {
  constructor(private readonly prisma: PrismaService) {}

  async nilaiEssay(jawabanId: number, dto: NilaiEssayDto) {
    const jawaban = await this.prisma.jawabanSiswa.findUnique({
      where: {
        id: jawabanId,
      },
      include: {
        soal: true,
        pesertaUjian: true,
      },
    });

    if (!jawaban) {
      throw new NotFoundException('Jawaban tidak ditemukan');
    }

    // Pastikan soal adalah Essay
    if (jawaban.soal.tipe !== 'ESSAY') {
      throw new BadRequestException(
        'Jawaban ini bukan soal Essay',
      );
    }

    // Ujian yang sudah selesai tetap boleh dinilai
    if (dto.nilai > jawaban.soal.bobot) {
      throw new BadRequestException(
        `Nilai tidak boleh lebih dari bobot soal (${jawaban.soal.bobot})`,
      );
    }

    const updated = await this.prisma.jawabanSiswa.update({
      where: {
        id: jawabanId,
      },
      data: {
        nilai: dto.nilai,
        dinilai: true,
      },
      include: {
        soal: true,
        pesertaUjian: {
          include: {
            siswa: true,
            ulangan: true,
          },
        },
      },
    });

    return updated;
  }

  async getEssayBelumDinilai() {
    return this.prisma.jawabanSiswa.findMany({
      where: {
        dinilai: false,
        soal: {
          tipe: 'ESSAY',
        },
      },
      include: {
        soal: true,
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
        createdAt: 'asc',
      },
    });
  }
}