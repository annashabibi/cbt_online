import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJawabanDto } from './dto/create-jawaban.dto';

@Injectable()
export class JawabanService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPeserta(pesertaUjianId: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id: pesertaUjianId },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    return this.prisma.jawabanSiswa.findMany({
      where: { pesertaUjianId },
      include: {
        soal: true,
      },
      orderBy: {
        soalId: 'asc',
      },
    });
  }

  async createOrUpdate(dto: CreateJawabanDto) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id: dto.pesertaUjianId },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (peserta.status !== 'MENGERJAKAN') {
      throw new BadRequestException(
        'Ujian sudah selesai dan tidak dapat diubah',
      );
    }

    const soal = await this.prisma.soal.findUnique({
      where: { id: dto.soalId },
    });

    if (!soal) {
      throw new NotFoundException('Soal tidak ditemukan');
    }

    if (soal.ulanganId !== peserta.ulanganId) {
      throw new BadRequestException(
        'Soal bukan bagian dari ulangan ini',
      );
    }

    let nilai = 0;
    let dinilai = false;

    // PG otomatis dinilai
    if (soal.tipe === 'PG') {
      dinilai = true;

      if (
        dto.jawaban &&
        soal.jawabanBenar &&
        dto.jawaban.toUpperCase() === soal.jawabanBenar.toUpperCase()
      ) {
        nilai = soal.bobot;
      }
    }

    // Essay menunggu penilaian
    if (soal.tipe === 'ESSAY') {
      nilai = 0;
      dinilai = false;
    }

    return this.prisma.jawabanSiswa.upsert({
      where: {
        pesertaUjianId_soalId: {
          pesertaUjianId: dto.pesertaUjianId,
          soalId: dto.soalId,
        },
      },
      update: {
        jawaban: dto.jawaban,
        nilai,
        dinilai,
      },
      create: {
        pesertaUjianId: dto.pesertaUjianId,
        soalId: dto.soalId,
        jawaban: dto.jawaban,
        nilai,
        dinilai,
      },
      include: {
        soal: true,
      },
    });
  }

  async findOne(id: number) {
    const jawaban = await this.prisma.jawabanSiswa.findUnique({
      where: { id },
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

    if (!jawaban) {
      throw new NotFoundException('Jawaban tidak ditemukan');
    }

    return jawaban;
  }
}