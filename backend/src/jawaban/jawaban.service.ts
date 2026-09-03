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

  // =========================================================
  // GET JAWABAN BERDASARKAN PESERTA UJIAN
  // =========================================================
async findByPeserta(
  pesertaUjianId: number,
  siswaId: number,
) {
  // Pastikan peserta ujian memang milik siswa yang sedang login
  const peserta = await this.prisma.pesertaUjian.findFirst({
    where: {
      id: pesertaUjianId,
      siswaId,
    },
  });

  if (!peserta) {
    throw new NotFoundException(
      'Peserta ujian tidak ditemukan',
    );
  }

  return this.prisma.jawabanSiswa.findMany({
    where: {
      pesertaUjianId,
    },
    include: {
      soal: {
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
      },
    },
    orderBy: {
      soalId: 'asc',
    },
  });
}

// =========================================================
// SIMPAN / UPDATE JAWABAN SISWA
// =========================================================
async createOrUpdate(
  dto: CreateJawabanDto,
  siswaId: number,
) {
  // Pastikan peserta ujian milik siswa yang sedang login
  const peserta = await this.prisma.pesertaUjian.findFirst({
    where: {
      id: dto.pesertaUjianId,
      siswaId,
    },
    include: {
      ulangan: true,
    },
  });

  if (!peserta) {
    throw new NotFoundException(
      'Peserta ujian tidak ditemukan',
    );
  }

  // Jawaban tidak boleh diubah setelah ujian selesai
  if (peserta.status !== 'MENGERJAKAN') {
    throw new BadRequestException(
      'Ujian sudah selesai dan tidak dapat diubah',
    );
  }

  // Cek batas waktu ujian dari backend
  const waktuMulai = new Date(
    peserta.mulai,
  ).getTime();

  const durasiMs =
    peserta.ulangan.durasi * 60 * 1000;

  const waktuSelesai =
    waktuMulai + durasiMs;

  if (Date.now() >= waktuSelesai) {
    throw new BadRequestException(
      'Waktu ujian telah habis',
    );
  }

  // Cari soal
  const soal = await this.prisma.soal.findUnique({
    where: {
      id: dto.soalId,
    },
  });

  if (!soal) {
    throw new NotFoundException(
      'Soal tidak ditemukan',
    );
  }

  // Pastikan soal memang berasal dari ulangan peserta
  if (soal.ulanganId !== peserta.ulanganId) {
    throw new BadRequestException(
      'Soal bukan bagian dari ulangan ini',
    );
  }

  let nilai = 0;
  let dinilai = false;

  // =====================================================
  // PILIHAN GANDA
  // =====================================================
  if (soal.tipe === 'PG') {
    dinilai = true;

    if (
      dto.jawaban &&
      soal.jawabanBenar &&
      dto.jawaban.toUpperCase() ===
        soal.jawabanBenar.toUpperCase()
    ) {
      nilai = soal.bobot;
    }
  }

  // =====================================================
  // ESSAY
  // =====================================================
  if (soal.tipe === 'ESSAY') {
    nilai = 0;
    dinilai = false;
  }

  // =====================================================
  // UPSERT JAWABAN
  // =====================================================
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

    // Jangan kirim jawabanBenar ke browser
    include: {
      soal: {
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
      },
    },
  });
}

  // =========================================================
  // GET SATU JAWABAN
  // =========================================================
async findOne(
  id: number,
  siswaId: number,
) {
  // Pastikan jawaban tersebut milik peserta ujian
  // yang dimiliki oleh siswa yang sedang login
  const jawaban =
    await this.prisma.jawabanSiswa.findFirst({
      where: {
        id,

        pesertaUjian: {
          siswaId,
        },
      },

      include: {
        soal: {
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
        },

        pesertaUjian: {
          include: {
            siswa: true,
            ulangan: true,
          },
        },
      },
    });

  if (!jawaban) {
    throw new NotFoundException(
      'Jawaban tidak ditemukan',
    );
  }

  return jawaban;
}
}