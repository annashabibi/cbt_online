import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HasilService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // HITUNG NILAI
  // =========================================================
  async hitungNilai(
    pesertaUjianId: number,
    siswaId: number,
  ) {
    // Pastikan peserta ujian adalah milik siswa yang login
    const peserta =
      await this.prisma.pesertaUjian.findFirst({
        where: {
          id: pesertaUjianId,
          siswaId,
        },
        include: {
          jawaban: {
            include: {
              soal: true,
            },
          },
        },
      });

    if (!peserta) {
      throw new NotFoundException(
        'Peserta ujian tidak ditemukan',
      );
    }

    if (peserta.status !== 'SELESAI') {
      throw new BadRequestException(
        'Ujian belum selesai',
      );
    }

    // Pastikan semua Essay sudah dinilai
    const essayBelumDinilai =
      peserta.jawaban.some(
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

  // =========================================================
  // GET SEMUA HASIL MILIK SISWA
  // =========================================================
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


async findAllForSiswa(siswaId: number) {
  return this.prisma.hasilUjian.findMany({
    where: {
      pesertaUjian: {
        siswaId,
      },
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
    orderBy: {
      nilaiAkhir: 'desc',
    },
  });
}

  // =========================================================
  // GET DETAIL HASIL
  // =========================================================
 async findOne(
  id: number,
  siswaId: number,
) {
  const hasil =
    await this.prisma.hasilUjian.findFirst({
      where: {
        id,

        pesertaUjian: {
          siswaId,
        },
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

            jawaban: {
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

// =========================================================
// GET DETAIL HASIL UNTUK ADMIN
// =========================================================
async findOneAdmin(id: number) {
  const hasil =
    await this.prisma.hasilUjian.findUnique({
      where: {
        id,
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