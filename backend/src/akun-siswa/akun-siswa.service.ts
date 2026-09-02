import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import { RegisterAkunSiswaDto } from './dto/register-akun-siswa.dto';
import { LoginAkunSiswaDto } from './dto/login-akun-siswa.dto';

@Injectable()
export class AkunSiswaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(dto: RegisterAkunSiswaDto) {
    // Cari siswa berdasarkan NIS
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        nis: dto.nis,
      },
      include: {
        kelas: true,
        akun: true,
      },
    });

    if (!siswa) {
      throw new NotFoundException(
        'NIS siswa tidak ditemukan',
      );
    }

    // Cek apakah siswa sudah memiliki akun
    if (siswa.akun) {
      throw new ConflictException(
        'Siswa sudah memiliki akun',
      );
    }

    // Cek username
    const existingUsername =
      await this.prisma.akunSiswa.findUnique({
        where: {
          username: dto.username,
        },
      });

    if (existingUsername) {
      throw new ConflictException(
        'Username sudah digunakan',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    // Buat akun
    const akun = await this.prisma.akunSiswa.create({
      data: {
        siswaId: siswa.id,
        username: dto.username,
        passwordHash,
      },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
      },
    });

    return {
      message: 'Registrasi berhasil',
      data: {
        id: akun.id,
        username: akun.username,
        siswa: {
          id: akun.siswa.id,
          nis: akun.siswa.nis,
          nama: akun.siswa.nama,
          jk: akun.siswa.jk,
          kelas: akun.siswa.kelas,
        },
      },
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(dto: LoginAkunSiswaDto) {
    const akun = await this.prisma.akunSiswa.findUnique({
      where: {
        username: dto.username,
      },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
      },
    });

    if (!akun) {
      throw new UnauthorizedException(
        'Username atau password salah',
      );
    }

    if (!akun.status) {
      throw new UnauthorizedException(
        'Akun siswa tidak aktif',
      );
    }

    // Cek password
    const passwordValid = await bcrypt.compare(
      dto.password,
      akun.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Username atau password salah',
      );
    }

    // Payload JWT
    const payload = {
      sub: akun.id,
      siswaId: akun.siswaId,
      username: akun.username,
      role: 'siswa',
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil',
      accessToken,
      user: {
        id: akun.id,
        username: akun.username,
        role: 'siswa',
        siswa: {
          id: akun.siswa.id,
          nis: akun.siswa.nis,
          nama: akun.siswa.nama,
          jk: akun.siswa.jk,
          kelas: akun.siswa.kelas,
        },
      },
    };
  }
}