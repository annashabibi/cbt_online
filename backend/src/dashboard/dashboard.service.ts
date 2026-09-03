import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // DASHBOARD ADMIN
  // =========================
  async getAdminDashboard() {
    const [
      totalSiswa,
      totalUlangan,
      totalSoal,
      totalHasil,
      ulanganAktif,
      ulanganTerbaru,
      totalPeserta,
      totalSelesai,
      hasilNilai,
    ] = await Promise.all([
      this.prisma.siswa.count(),

      this.prisma.ulangan.count(),

      this.prisma.soal.count(),

      this.prisma.hasilUjian.count(),

      this.prisma.ulangan.count({
        where: {
          status: true,
        },
      }),

      this.prisma.ulangan.findMany({
        orderBy: {
          tanggal: 'desc',
        },
        take: 5,
        include: {
          kelas: true,
          soal: {
            select: {
              id: true,
            },
          },
        },
      }),

      this.prisma.pesertaUjian.count(),

      this.prisma.pesertaUjian.count({
        where: {
          status: 'SELESAI',
        },
      }),

      this.prisma.hasilUjian.findMany({
        select: {
          id: true,
          nilaiPG: true,
          nilaiEssay: true,
          nilaiAkhir: true,
        },
      }),
    ]);

    // =========================
    // HITUNG RATA-RATA NILAI
    // =========================
    const nilaiValid: number[] = hasilNilai
      .map((item: { nilaiAkhir: unknown }) =>
        Number(item.nilaiAkhir),
      )
      .filter((nilai: number) => !Number.isNaN(nilai));

    const rataRataNilai =
      nilaiValid.length > 0
        ? nilaiValid.reduce(
            (total: number, nilai: number) =>
              total + nilai,
            0,
          ) / nilaiValid.length
        : 0;

    // =========================
    // HITUNG JUMLAH LULUS
    // =========================
    const jumlahLulus = nilaiValid.filter(
      (nilai: number) => nilai >= 75,
    ).length;

    const tingkatKelulusan =
      nilaiValid.length > 0
        ? (jumlahLulus / nilaiValid.length) * 100
        : 0;

    // =========================
    // RESPONSE ADMIN
    // =========================
    return {
      statistik: {
        totalSiswa,
        totalUlangan,
        totalSoal,
        totalHasil,
        ulanganAktif,
        totalPeserta,
        totalSelesai,

        rataRataNilai: Number(
          rataRataNilai.toFixed(2),
        ),

        tingkatKelulusan: Number(
          tingkatKelulusan.toFixed(2),
        ),
      },

      ulanganTerbaru: ulanganTerbaru.map((ulangan) => ({
        id: ulangan.id,
        kode: ulangan.kode,
        judul: ulangan.judul,
        deskripsi: ulangan.deskripsi,
        tanggal: ulangan.tanggal,
        durasi: ulangan.durasi,
        status: ulangan.status,

        kelas: ulangan.kelas
          ? {
              id: ulangan.kelas.id,
              kode: ulangan.kelas.kode,
              nama: ulangan.kelas.nama,
            }
          : null,

        jumlahSoal: ulangan.soal.length,
      })),
    };
  }

  // =========================
  // DASHBOARD SISWA
  // =========================
  async getSiswaDashboard(siswaId: number) {
    // =========================
    // CARI DATA SISWA
    // =========================
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

    // =========================
    // CARI ULANGAN SESUAI KELAS
    // =========================
    const ulangan = await this.prisma.ulangan.findMany({
      where: {
        kelasId: siswa.kelasId,
        status: true,
      },

      orderBy: {
        tanggal: 'asc',
      },

      include: {
        kelas: true,

        soal: {
          select: {
            id: true,
          },
        },
      },
    });

    // =========================
    // CARI PESERTA UJIAN SISWA
    // =========================
    const peserta =
      await this.prisma.pesertaUjian.findMany({
        where: {
          siswaId,
        },

        orderBy: {
          mulai: 'desc',
        },
      });

    // =========================
    // CARI HASIL UJIAN SISWA
    // =========================
    const hasil =
      await this.prisma.hasilUjian.findMany({
        where: {
          pesertaUjian: {
            siswaId,
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    // =========================
    // HITUNG RATA-RATA NILAI
    // =========================
    const nilaiValid: number[] = hasil
      .map((item: { nilaiAkhir: unknown }) =>
        Number(item.nilaiAkhir),
      )
      .filter((nilai: number) => !Number.isNaN(nilai));

    const rataRataNilai =
      nilaiValid.length > 0
        ? nilaiValid.reduce(
            (total: number, nilai: number) =>
              total + nilai,
            0,
          ) / nilaiValid.length
        : 0;

    // =========================
    // HITUNG STATUS UJIAN
    // =========================
    const jumlahSelesai = peserta.filter(
      (item) => item.status === 'SELESAI',
    ).length;

    const jumlahMengerjakan = peserta.filter(
      (item) => item.status === 'MENGERJAKAN',
    ).length;

    // =========================
    // RESPONSE SISWA
    // =========================
    return {
      siswa: {
        id: siswa.id,
        nis: siswa.nis,
        nama: siswa.nama,
        jk: siswa.jk,

        kelas: siswa.kelas
          ? {
              id: siswa.kelas.id,
              kode: siswa.kelas.kode,
              nama: siswa.kelas.nama,
            }
          : null,
      },

      statistik: {
        totalUjian: ulangan.length,
        totalDikerjakan: jumlahSelesai,
        sedangMengerjakan: jumlahMengerjakan,
        totalHasil: hasil.length,

        rataRataNilai: Number(
          rataRataNilai.toFixed(2),
        ),
      },

      ulangan: ulangan.map((item) => {
        const pesertaUjian = peserta.find(
          (p) => p.ulanganId === item.id,
        );

        return {
          id: item.id,
          kode: item.kode,
          judul: item.judul,
          deskripsi: item.deskripsi,
          tanggal: item.tanggal,
          durasi: item.durasi,
          status: item.status,

          kelas: item.kelas
            ? {
                id: item.kelas.id,
                kode: item.kelas.kode,
                nama: item.kelas.nama,
              }
            : null,

          jumlahSoal: item.soal.length,

          peserta: pesertaUjian
            ? {
                id: pesertaUjian.id,
                status: pesertaUjian.status,
                mulai: pesertaUjian.mulai,
                selesai: pesertaUjian.selesai,
              }
            : null,
        };
      }),

      hasil: hasil.map((item) => ({
        id: item.id,
        nilaiPG: item.nilaiPG,
        nilaiEssay: item.nilaiEssay,
        nilaiAkhir: item.nilaiAkhir,
        status: item.status,
        createdAt: item.createdAt,
      })),
    };
  }
}