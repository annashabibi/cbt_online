import {
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

  // =========================================================
  // GET SEMUA ULANGAN
  // =========================================================
  async findAll() {
    return this.prisma.ulangan.findMany({
      include: {
        kelas: {
          include: {
            kelas: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET ULANGAN UNTUK SISWA
  // =========================================================
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

    return this.prisma.ulangan.findMany({
      where: {
        status: true,
        kelas: {
          some: {
            kelasId: siswa.kelasId,
          },
        },
      },
      include: {
        kelas: {
          include: {
            kelas: true,
          },
        },
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

  // =========================================================
  // GET DETAIL ULANGAN UNTUK SISWA
  // =========================================================
  async findOne(
    id: number,
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

    const ulangan =
      await this.prisma.ulangan.findFirst({
        where: {
          id,
          status: true,
          kelas: {
            some: {
              kelasId: siswa.kelasId,
            },
          },
        },
        include: {
          kelas: {
            include: {
              kelas: true,
            },
          },
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
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

    if (!ulangan) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    return ulangan;
  }

  // =========================================================
  // PROGRESS SISWA MENGERJAKAN ULANGAN
  // =========================================================
  async getProgress(id: number) {
    const ulangan =
      await this.prisma.ulangan.findUnique({
        where: {
          id,
        },
        include: {
          kelas: true,
        },
      });

    if (!ulangan) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    // =======================================================
    // AMBIL SEMUA SISWA DARI SEMUA KELAS PESERTA ULANGAN
    // =======================================================
    const semuaSiswa =
      await this.prisma.siswa.findMany({
        where: {
          kelasId: {
            in: ulangan.kelas.map(
              (item) => item.kelasId,
            ),
          },
        },
        orderBy: {
          nama: 'asc',
        },
      });

    // =======================================================
    // AMBIL SEMUA PESERTA ULANGAN
    // =======================================================
    const peserta =
      await this.prisma.pesertaUjian.findMany({
        where: {
          ulanganId: id,
        },
        select: {
          siswaId: true,
          status: true,
          mulai: true,
          selesai: true,
        },
      });

    // =======================================================
    // MAPPING SISWA
    // =======================================================
    const pesertaMap = new Map(
      peserta.map((item) => [
        item.siswaId,
        item,
      ]),
    );

    // =======================================================
    // SEDANG MENGERJAKAN
    // =======================================================
    const mengerjakan =
      semuaSiswa.filter(
        (siswa) =>
          pesertaMap.get(siswa.id)
            ?.status === 'MENGERJAKAN',
      );

    // =======================================================
    // SUDAH SELESAI
    // =======================================================
    const selesai =
      semuaSiswa.filter(
        (siswa) =>
          pesertaMap.get(siswa.id)
            ?.status === 'SELESAI',
      );

    // =======================================================
    // BELUM MENGERJAKAN
    // =======================================================
    const belumMengerjakan =
      semuaSiswa.filter(
        (siswa) =>
          !pesertaMap.has(siswa.id),
      );

    return {
      ulangan: {
        id: ulangan.id,
        kode: ulangan.kode,
        judul: ulangan.judul,
        kelas: ulangan.kelas,
      },

      totalSiswa: semuaSiswa.length,

      mengerjakan: mengerjakan.length,

      selesai: selesai.length,

      belumMengerjakan:
        belumMengerjakan.length,

      daftarBelumMengerjakan:
        belumMengerjakan.map(
          (siswa) => ({
            id: siswa.id,
            nama: siswa.nama,
            nis: siswa.nis,
          }),
        ),

      daftarSudahMengerjakan:
        semuaSiswa
          .filter((siswa) =>
            pesertaMap.has(siswa.id),
          )
          .map((siswa) => {
            const dataPeserta =
              pesertaMap.get(
                siswa.id,
              );

            return {
              id: siswa.id,
              nama: siswa.nama,
              nis: siswa.nis,
              status:
                dataPeserta?.status ||
                null,
              mulai:
                dataPeserta?.mulai ||
                null,
              selesai:
                dataPeserta?.selesai ||
                null,
            };
          }),
    };
  }

  // =========================================================
  // CREATE ULANGAN
  // =========================================================
  async create(
    dto: CreateUlanganDto,
  ) {
    // -------------------------------------------------------
    // CEK KODE
    // -------------------------------------------------------
    const existing =
      await this.prisma.ulangan.findUnique({
        where: {
          kode: dto.kode,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Kode ulangan sudah digunakan',
      );
    }

    // -------------------------------------------------------
    // CEK KELAS
    // -------------------------------------------------------
    const kelasIds = dto.kelasIds ?? [];

    if (kelasIds.length === 0) {
      throw new NotFoundException(
        'Minimal pilih satu kelas',
      );
    }

    // Hapus ID duplikat
    const uniqueKelasIds = [
      ...new Set(kelasIds),
    ];

    const jumlahKelas =
      await this.prisma.kelas.count({
        where: {
          id: {
            in: uniqueKelasIds,
          },
        },
      });

    if (
      jumlahKelas !==
      uniqueKelasIds.length
    ) {
      throw new NotFoundException(
        'Salah satu kelas tidak ditemukan',
      );
    }

    // -------------------------------------------------------
    // BUAT ULANGAN + RELASI KELAS
    // -------------------------------------------------------
    return this.prisma.ulangan.create({
      data: {
        kode: dto.kode,
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        tanggal: new Date(dto.tanggal),
        durasi: dto.durasi,
        status: dto.status ?? true,

        kelas: {
          create: uniqueKelasIds.map(
            (kelasId) => ({
              kelasId,
            }),
          ),
        },
      },

      include: {
        kelas: {
          include: {
            kelas: true,
          },
        },
      },
    });
  }

  // =========================================================
  // UPDATE ULANGAN
  // =========================================================
  async update(
    id: number,
    dto: UpdateUlanganDto,
  ) {
    const existing =
      await this.prisma.ulangan.findUnique({
        where: {
          id,
        },
        include: {
          kelas: true,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    // -------------------------------------------------------
    // CEK KODE
    // -------------------------------------------------------
    if (
      dto.kode &&
      dto.kode !== existing.kode
    ) {
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

    // -------------------------------------------------------
    // VALIDASI KELAS JIKA DIUBAH
    // -------------------------------------------------------
    let uniqueKelasIds:
      number[] | undefined;

    if (dto.kelasIds !== undefined) {
      if (dto.kelasIds.length === 0) {
        throw new NotFoundException(
          'Minimal pilih satu kelas',
        );
      }

      uniqueKelasIds = [
        ...new Set(dto.kelasIds),
      ];

      const jumlahKelas =
        await this.prisma.kelas.count({
          where: {
            id: {
              in: uniqueKelasIds,
            },
          },
        });

      if (
        jumlahKelas !==
        uniqueKelasIds.length
      ) {
        throw new NotFoundException(
          'Salah satu kelas tidak ditemukan',
        );
      }
    }

    // -------------------------------------------------------
    // UPDATE DALAM TRANSACTION
    // -------------------------------------------------------
    return this.prisma.$transaction(
      async (tx) => {
        // Update data utama
        const ulangan =
          await tx.ulangan.update({
            where: {
              id,
            },
            data: {
              ...(dto.kode !== undefined && {
                kode: dto.kode,
              }),

              ...(dto.judul !== undefined && {
                judul: dto.judul,
              }),

              ...(dto.deskripsi !==
                undefined && {
                deskripsi:
                  dto.deskripsi,
              }),

              ...(dto.tanggal !==
                undefined && {
                tanggal: new Date(
                  dto.tanggal,
                ),
              }),

              ...(dto.durasi !==
                undefined && {
                durasi: dto.durasi,
              }),

              ...(dto.status !==
                undefined && {
                status: dto.status,
              }),
            },
          });

        // ---------------------------------------------------
        // UPDATE KELAS
        // ---------------------------------------------------
        if (
          uniqueKelasIds !==
          undefined
        ) {
          // Hapus relasi kelas lama
          await tx.ulanganKelas.deleteMany({
            where: {
              ulanganId: id,
            },
          });

          // Buat relasi kelas baru
          await tx.ulanganKelas.createMany({
            data: uniqueKelasIds.map(
              (kelasId) => ({
                ulanganId: id,
                kelasId,
              }),
            ),
            skipDuplicates: true,
          });
        }

        // ---------------------------------------------------
        // RETURN DATA TERBARU
        // ---------------------------------------------------
        return tx.ulangan.findUnique({
          where: {
            id,
          },
          include: {
            kelas: {
              include: {
                kelas: true,
              },
            },
          },
        });
      },
    );
  }

  // =========================================================
  // DELETE ULANGAN
  // =========================================================
  async remove(id: number) {
    const existing =
      await this.prisma.ulangan.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Ulangan tidak ditemukan',
      );
    }

    await this.prisma.ulangan.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Ulangan berhasil dihapus',
    };
  }
}