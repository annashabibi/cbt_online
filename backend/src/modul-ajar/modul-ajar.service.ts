import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulAjarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.modulAjar.findMany({
      include: {
        kelas: true,
        mataPelajaran: true,
        semester: true,
        tujuanPembelajaran: {
          orderBy: { urutan: 'asc' },
        },
        kegiatanPembelajaran: {
          orderBy: { urutan: 'asc' },
        },
        asesmen: {
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const data = await this.prisma.modulAjar.findUnique({
      where: { id },
      include: {
        kelas: true,
        mataPelajaran: true,
        semester: true,
        tujuanPembelajaran: {
          orderBy: { urutan: 'asc' },
        },
        kegiatanPembelajaran: {
          orderBy: { urutan: 'asc' },
        },
        asesmen: {
          orderBy: { urutan: 'asc' },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Modul Ajar tidak ditemukan');
    }

    return data;
  }

  async create(data: any) {
    const {
      namaPenyusun,
      programKeahlian,
      judulElemen,
      capaianPembelajaran,
      kelasId,
      mataPelajaranId,
      semesterId,
      tujuanPembelajaran = [],
      kegiatanPembelajaran = [],
      asesmen = [],
      pengayaan,
      remedial,
      refleksiPesertaDidik,
      refleksiGuru,
    } = data;

    return this.prisma.modulAjar.create({
      data: {
        namaPenyusun,
        programKeahlian,
        judulElemen,
        capaianPembelajaran,

        kelasId: Number(kelasId),
        mataPelajaranId: Number(mataPelajaranId),
        semesterId: Number(semesterId),

        pengayaan,
        remedial,
        refleksiPesertaDidik,
        refleksiGuru,

        tujuanPembelajaran: {
          create: tujuanPembelajaran.map((item: any, index: number) => ({
            tujuan: item.tujuan,
            urutan: item.urutan ?? index + 1,
          })),
        },

        kegiatanPembelajaran: {
          create: kegiatanPembelajaran.map((item: any, index: number) => ({
            jenis: item.jenis,
            aktivitas: item.aktivitas,
            durasi:
              item.durasi !== undefined &&
              item.durasi !== null &&
              item.durasi !== ''
                ? Number(item.durasi)
                : null,
            urutan: item.urutan ?? index + 1,
          })),
        },

        asesmen: {
          create: asesmen.map((item: any, index: number) => ({
            jenis: item.jenis,
            deskripsi: item.deskripsi,
            urutan: item.urutan ?? index + 1,
          })),
        },
      },

      include: {
        kelas: true,
        mataPelajaran: true,
        semester: true,
        tujuanPembelajaran: true,
        kegiatanPembelajaran: true,
        asesmen: true,
      },
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id);

    const {
      namaPenyusun,
      programKeahlian,
      judulElemen,
      capaianPembelajaran,
      kelasId,
      mataPelajaranId,
      semesterId,
      tujuanPembelajaran = [],
      kegiatanPembelajaran = [],
      asesmen = [],
      pengayaan,
      remedial,
      refleksiPesertaDidik,
      refleksiGuru,
    } = data;

    return this.prisma.$transaction(async (tx) => {
      await tx.tujuanPembelajaran.deleteMany({
        where: { modulAjarId: id },
      });

      await tx.kegiatanPembelajaran.deleteMany({
        where: { modulAjarId: id },
      });

      await tx.asesmen.deleteMany({
        where: { modulAjarId: id },
      });

      return tx.modulAjar.update({
        where: { id },

        data: {
          namaPenyusun,
          programKeahlian,
          judulElemen,
          capaianPembelajaran,

          kelasId: Number(kelasId),
          mataPelajaranId: Number(mataPelajaranId),
          semesterId: Number(semesterId),

          pengayaan,
          remedial,
          refleksiPesertaDidik,
          refleksiGuru,

          tujuanPembelajaran: {
            create: tujuanPembelajaran.map((item: any, index: number) => ({
              tujuan: item.tujuan,
              urutan: item.urutan ?? index + 1,
            })),
          },

          kegiatanPembelajaran: {
            create: kegiatanPembelajaran.map(
              (item: any, index: number) => ({
                jenis: item.jenis,
                aktivitas: item.aktivitas,
                durasi:
                  item.durasi !== undefined &&
                  item.durasi !== null &&
                  item.durasi !== ''
                    ? Number(item.durasi)
                    : null,
                urutan: item.urutan ?? index + 1,
              }),
            ),
          },

          asesmen: {
            create: asesmen.map((item: any, index: number) => ({
              jenis: item.jenis,
              deskripsi: item.deskripsi,
              urutan: item.urutan ?? index + 1,
            })),
          },
        },

        include: {
          kelas: true,
          mataPelajaran: true,
          semester: true,
          tujuanPembelajaran: true,
          kegiatanPembelajaran: true,
          asesmen: true,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.modulAjar.delete({
      where: { id },
    });
  }
}