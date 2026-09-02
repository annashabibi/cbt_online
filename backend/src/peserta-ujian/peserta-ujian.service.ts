import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePesertaUjianDto } from './dto/create-peserta-ujian.dto';

@Injectable()
export class PesertaUjianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pesertaUjian.findMany({
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        ulangan: true,
        hasil: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        ulangan: {
          include: {
            soal: true,
          },
        },
        jawaban: {
          include: {
            soal: true,
          },
        },
        hasil: true,
      },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    return peserta;
  }

  async create(dto: CreatePesertaUjianDto) {
    const ulangan = await this.prisma.ulangan.findUnique({
      where: {
        id: dto.ulanganId,
      },
    });

    if (!ulangan) {
      throw new NotFoundException('Ulangan tidak ditemukan');
    }

    if (!ulangan.status) {
      throw new BadRequestException('Ulangan sedang tidak aktif');
    }

    const siswa = await this.prisma.siswa.findUnique({
      where: {
        id: dto.siswaId,
      },
      include: {
        kelas: true,
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // Pastikan siswa berasal dari kelas yang ditentukan untuk ulangan
    if (siswa.kelasId !== ulangan.kelasId) {
      throw new BadRequestException(
        'Siswa tidak terdaftar pada kelas ulangan ini',
      );
    }

    // Cegah siswa mengikuti ulangan yang sama lebih dari satu kali
    const existing = await this.prisma.pesertaUjian.findUnique({
      where: {
        ulanganId_siswaId: {
          ulanganId: dto.ulanganId,
          siswaId: dto.siswaId,
        },
      },
    });

    if (existing) {
      return this.findOne(existing.id);
    }

    const peserta = await this.prisma.pesertaUjian.create({
      data: {
        ulanganId: dto.ulanganId,
        siswaId: dto.siswaId,
        status: 'MENGERJAKAN',
      },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        ulangan: true,
      },
    });

    return peserta;
  }

  async mulai(id: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (peserta.status !== 'MENGERJAKAN') {
      throw new BadRequestException(
        `Ujian sudah berstatus ${peserta.status}`,
      );
    }

    return this.prisma.pesertaUjian.update({
      where: { id },
      data: {
        mulai: new Date(),
      },
    });
  }

  async selesai(id: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (peserta.status === 'SELESAI') {
      throw new BadRequestException('Ujian sudah diselesaikan');
    }

    return this.prisma.pesertaUjian.update({
      where: { id },
      data: {
        selesai: new Date(),
        status: 'SELESAI',
      },
    });
  }

  async remove(id: number) {
    const peserta = await this.prisma.pesertaUjian.findUnique({
      where: { id },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    return this.prisma.pesertaUjian.delete({
      where: { id },
    });
  }
}