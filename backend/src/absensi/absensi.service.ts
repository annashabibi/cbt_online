import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbsensiService {
  constructor(private readonly prisma: PrismaService) {}

  // Ambil daftar siswa berdasarkan kelas
  async getSiswaByKelas(kelasId: number) {
    return this.prisma.siswa.findMany({
      where: {
        kelasId,
      },
      orderBy: {
        nama: 'asc',
      },
      select: {
        id: true,
        nis: true,
        nama: true,
        jk: true,
        kelasId: true,
      },
    });
  }

  // Buat pertemuan absensi
  async createPertemuan(data: {
    kelasId: number;
    mataPelajaranId: number;
    semesterId: number;
    pertemuanKe: number;
    tanggal: Date;
  }) {
    const pertemuan = await this.prisma.absensiPertemuan.create({
      data,
      include: {
        kelas: true,
        mataPelajaran: true,
        semester: true,
      },
    });

    return pertemuan;
  }

  async updatePertemuan(
  id: number,
  data: {
    tanggal: Date;
  },
) {
  return this.prisma.absensiPertemuan.update({
    where: { id },
    data: {
      tanggal: data.tanggal,
    },
    include: {
      kelas: true,
      mataPelajaran: true,
      semester: true,
    },
  });
}

  // Ambil data pertemuan
  async getPertemuan(params: {
    kelasId: number;
    mataPelajaranId: number;
    semesterId: number;
  }) {
    return this.prisma.absensiPertemuan.findMany({
      where: {
        kelasId: params.kelasId,
        mataPelajaranId: params.mataPelajaranId,
        semesterId: params.semesterId,
      },
      orderBy: {
        pertemuanKe: 'asc',
      },
    });
  }

  // Simpan / ubah status absensi siswa
  async simpanAbsensi(data: {
    absensiPertemuanId: number;
    siswaId: number;
    status: string | null;
  }) {
    return this.prisma.absensiSiswa.upsert({
      where: {
        absensiPertemuanId_siswaId: {
          absensiPertemuanId: data.absensiPertemuanId,
          siswaId: data.siswaId,
        },
      },
      update: {
        status: data.status,
      },
      create: {
        absensiPertemuanId: data.absensiPertemuanId,
        siswaId: data.siswaId,
        status: data.status,
      },
    });
  }

  // Ambil absensi satu pertemuan
  async getAbsensiPertemuan(absensiPertemuanId: number) {
    return this.prisma.absensiSiswa.findMany({
      where: {
        absensiPertemuanId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            nis: true,
            nama: true,
            jk: true,
          },
        },
      },
      orderBy: {
        siswa: {
          nama: 'asc',
        },
      },
    });
  }

  // Rekap absensi siswa
  async getRekapSiswa(params: {
    kelasId: number;
    mataPelajaranId: number;
    semesterId: number;
  }) {
    const siswa = await this.prisma.siswa.findMany({
      where: {
        kelasId: params.kelasId,
      },
      orderBy: {
        nama: 'asc',
      },
    });

    const pertemuan = await this.prisma.absensiPertemuan.findMany({
      where: {
        kelasId: params.kelasId,
        mataPelajaranId: params.mataPelajaranId,
        semesterId: params.semesterId,
      },
      include: {
        absensiSiswa: true,
      },
      orderBy: {
        pertemuanKe: 'asc',
      },
    });

    return siswa.map((s) => {
      const data = pertemuan.flatMap((p) =>
        p.absensiSiswa.filter((a) => a.siswaId === s.id),
      );

      const hadir = data.filter((a) => a.status === 'H').length;
      const izin = data.filter((a) => a.status === 'I').length;
      const sakit = data.filter((a) => a.status === 'S').length;
      const alpa = data.filter((a) => a.status === 'A').length;

      const totalDiisi = hadir + izin + sakit + alpa;

      const persentase =
        totalDiisi > 0
          ? Number(((hadir / totalDiisi) * 100).toFixed(2))
          : 0;

      return {
        siswaId: s.id,
        nis: s.nis,
        nama: s.nama,
        jk: s.jk,
        hadir,
        izin,
        sakit,
        alpa,
        persentase,
      };
    });
  }
}