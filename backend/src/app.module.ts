import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { KelasModule } from './kelas/kelas.module';
import { SiswaModule } from './siswa/siswa.module';
import { AkunSiswaModule } from './akun-siswa/akun-siswa.module';
import { AuthModule } from './auth/auth.module';
import { UlanganModule } from './ulangan/ulangan.module';
import { SoalModule } from './soal/soal.module';
import { PesertaUjianModule } from './peserta-ujian/peserta-ujian.module';
import { JawabanModule } from './jawaban/jawaban.module';
import { PenilaianModule } from './penilaian/penilaian.module';
import { HasilModule } from './hasil/hasil.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AbsensiModule } from './absensi/absensi.module';
import { MataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module';
import { SemesterModule } from './semester/semester.module';
import { ModulAjarModule } from './modul-ajar/modul-ajar.module';
@Module({
imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  PrismaModule,
  AuthModule,
  KelasModule,
  SiswaModule,
  AkunSiswaModule,
  UlanganModule,
  SoalModule,
  PesertaUjianModule,
  JawabanModule,
  PenilaianModule,
  HasilModule,
  DashboardModule,
  AbsensiModule,
  MataPelajaranModule,
  SemesterModule,
  ModulAjarModule,
],
  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}