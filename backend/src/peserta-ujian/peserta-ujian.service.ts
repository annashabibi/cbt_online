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

  // =========================================================
  // GET SEMUA PESERTA UJIAN
  // =========================================================
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

async findForSiswa(siswaId: number) {
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

  return this.prisma.pesertaUjian.findMany({
    where: {
      siswaId: siswaId,
    },
    include: {
      ulangan: {
        include: {
          kelas: true,
          soal: {
            select: {
              id: true,
            },
          },
        },
      },
      hasil: true,
      jawaban: {
        select: {
          id: true,
          soalId: true,
          jawaban: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}


async findSayaByUlangan(
  siswaId: number,
  ulanganId: number,
) {
  const peserta =
    await this.prisma.pesertaUjian.findUnique({
      where: {
        ulanganId_siswaId: {
          ulanganId,
          siswaId,
        },
      },
      include: {
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
        hasil: true,
      },
    });

  if (!peserta) {
    throw new NotFoundException(
      'Peserta ujian tidak ditemukan',
    );
  }

  return peserta;
}
  // =========================================================
  // GET DETAIL PESERTA
  // =========================================================
async findOne(
  id: number,
  siswaId: number,
) {
  const peserta = await this.prisma.pesertaUjian.findFirst({
    where: {
      id,
      siswaId,
    },
    include: {
      siswa: {
        include: {
          kelas: true,
        },
      },
      ulangan: {
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
      hasil: true,
    },
  });

  if (!peserta) {
    throw new NotFoundException(
      'Peserta ujian tidak ditemukan',
    );
  }

  return peserta;
}

  // =========================================================
  // CREATE / AMBIL PESERTA UJIAN
  // =========================================================
  async create(
    dto: CreatePesertaUjianDto,
    siswaId: number,
  ) {
    // -------------------------------------------------------
    // CEK ULANGAN
    // -------------------------------------------------------
    const ulangan = await this.prisma.ulangan.findUnique({
      where: {
        id: dto.ulanganId,
      },
    });

    if (!ulangan) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    // -------------------------------------------------------
    // CEK STATUS ULANGAN
    // -------------------------------------------------------
    if (!ulangan.status) {
      throw new BadRequestException(
        'Ulangan sedang tidak aktif',
      );
    }

    // -------------------------------------------------------
    // CEK SISWA
    // siswaId berasal dari JWT
    // -------------------------------------------------------
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        id: siswaId,
      },
      include: {
        kelas: true,
      },
    });

    if (!siswa) {
      throw new NotFoundException(
        'Siswa tidak ditemukan',
      );
    }

    // -------------------------------------------------------
    // CEK KELAS
    // -------------------------------------------------------
    if (siswa.kelasId !== ulangan.kelasId) {
      throw new BadRequestException(
        'Siswa tidak terdaftar pada kelas ulangan ini',
      );
    }

    // -------------------------------------------------------
    // CEK PESERTA SUDAH ADA
    // -------------------------------------------------------
    const existing =
      await this.prisma.pesertaUjian.findUnique({
        where: {
          ulanganId_siswaId: {
            ulanganId: dto.ulanganId,
            siswaId: siswaId,
          },
        },
      });

    // -------------------------------------------------------
    // SUDAH PERNAH TERDAFTAR
    // -------------------------------------------------------
if (existing) {
  return this.findOne(
    existing.id,
    siswaId,
  );
}
    // -------------------------------------------------------
    // BUAT PESERTA BARU
    // -------------------------------------------------------
    const peserta =
      await this.prisma.pesertaUjian.create({
        data: {
          ulanganId: dto.ulanganId,
          siswaId: siswaId,
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

  // =========================================================
  // MULAI / LANJUTKAN UJIAN
  // =========================================================
async mulai(id: number, siswaId: number) {
    const peserta =
      await this.prisma.pesertaUjian.findFirst({
        where: {
          id,
          siswaId,
        },
      });

    if (!peserta) {
      throw new NotFoundException(
        'Peserta ujian tidak ditemukan',
      );
    }

    // -------------------------------------------------------
    // CEK STATUS
    // -------------------------------------------------------
    if (peserta.status !== 'MENGERJAKAN') {
      throw new BadRequestException(
        `Ujian sudah berstatus ${peserta.status}`,
      );
    }

    // -------------------------------------------------------
    // JIKA SUDAH PERNAH MULAI
    // JANGAN RESET WAKTU MULAI
    // -------------------------------------------------------
    if (peserta.mulai) {
return this.findOne(
  id,
  siswaId,
);    }

    // -------------------------------------------------------
    // PERTAMA KALI MULAI
    // -------------------------------------------------------
    return this.prisma.pesertaUjian.update({
      where: {
        id,
      },
      data: {
        mulai: new Date(),
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
  }

 // =========================================================
// SELESAI UJIAN
// =========================================================
async selesai(id: number, siswaId: number) {
  const peserta =
    await this.prisma.pesertaUjian.findFirst({
      where: {
        id,
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

  // -------------------------------------------------------
  // SUDAH SELESAI
  // -------------------------------------------------------
  if (peserta.status === 'SELESAI') {
    throw new BadRequestException(
      'Ujian sudah diselesaikan',
    );
  }

  // -------------------------------------------------------
  // SELESAIKAN UJIAN
  // -------------------------------------------------------
  return this.prisma.pesertaUjian.update({
    where: {
      id,
    },
    data: {
      selesai: new Date(),
      status: 'SELESAI',
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
}
  // =========================================================
  // HAPUS PESERTA
  // =========================================================
async remove(
  id: number,
  siswaId: number,
) {
  const peserta =
    await this.prisma.pesertaUjian.findFirst({
      where: {
        id,
        siswaId,
      },
    });

  if (!peserta) {
    throw new NotFoundException(
      'Peserta ujian tidak ditemukan',
    );
  }

  return this.prisma.pesertaUjian.delete({
    where: {
      id,
    },
  });
}
}