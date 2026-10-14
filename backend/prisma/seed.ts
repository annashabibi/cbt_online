import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/ulangan_siswa?schema=public',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Memulai proses seeding data CBT Online...');

  // 1. Seed Kelas
  const kelas = await prisma.kelas.upsert({
    where: { kode: 'XII-RPL-1' },
    update: {},
    create: {
      kode: 'XII-RPL-1',
      nama: 'XII RPL 1',
    },
  });
  console.log('✅ Kelas siap: XII RPL 1');

  // 2. Hash Password untuk Akun
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const siswaPasswordHash = await bcrypt.hash('siswa123', 10);

  // 3. Seed Siswa & Akun ADMIN (Guru / Administrator)
  const siswaAdmin = await prisma.siswa.upsert({
    where: { nis: 'ADM001' },
    update: {
      nama: 'Guru Administrator',
      kelasId: kelas.id,
    },
    create: {
      nis: 'ADM001',
      nama: 'Guru Administrator',
      jk: 'L',
      kelasId: kelas.id,
    },
  });

  await prisma.akunSiswa.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: true,
    },
    create: {
      siswaId: siswaAdmin.id,
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: true,
    },
  });
  console.log('✅ Akun ADMIN siap: username "admin", password "admin123"');

  // 4. Seed Siswa & Akun SISWA (Peserta Ujian)
  const siswaBiasa = await prisma.siswa.upsert({
    where: { nis: 'SISWA001' },
    update: {
      nama: 'Budi Santoso',
      kelasId: kelas.id,
    },
    create: {
      nis: 'SISWA001',
      nama: 'Budi Santoso',
      jk: 'L',
      kelasId: kelas.id,
    },
  });

  await prisma.akunSiswa.upsert({
    where: { username: 'siswa' },
    update: {
      passwordHash: siswaPasswordHash,
      role: 'SISWA',
      status: true,
    },
    create: {
      siswaId: siswaBiasa.id,
      username: 'siswa',
      passwordHash: siswaPasswordHash,
      role: 'SISWA',
      status: true,
    },
  });
  console.log('✅ Akun SISWA siap: username "siswa", password "siswa123"');

  // 5. Seed Mata Pelajaran & Semester (untuk Modul Ajar & Absensi)
  await prisma.mataPelajaran.upsert({
    where: { kode: 'RPL-PWPB' },
    update: {},
    create: {
      kode: 'RPL-PWPB',
      nama: 'Pemrograman Web dan Perangkat Bergerak',
    },
  });

  await prisma.semester.upsert({
    where: {
      tahunAjaran_semester: {
        tahunAjaran: '2025/2026',
        semester: 'Genap',
      },
    },
    update: {},
    create: {
      tahunAjaran: '2025/2026',
      semester: 'Genap',
    },
  });
  console.log('✅ Mata Pelajaran & Semester siap');

  // 6. Seed Ulangan Contoh
  const ulangan = await prisma.ulangan.upsert({
    where: { kode: 'UAS-RPL-2026' },
    update: { status: true },
    create: {
      kode: 'UAS-RPL-2026',
      judul: 'Ulangan Simulasi Pemrograman Web',
      deskripsi: 'Simulasi CBT Online materi pemrograman web kelas XII',
      tanggal: new Date(),
      durasi: 60,
      status: true,
    },
  });

  await prisma.ulanganKelas.upsert({
    where: {
      ulanganId_kelasId: {
        ulanganId: ulangan.id,
        kelasId: kelas.id,
      },
    },
    update: {},
    create: {
      ulanganId: ulangan.id,
      kelasId: kelas.id,
    },
  });
  console.log('✅ Jadwal Ulangan siap');

  // 7. Seed Soal (Pilihan Ganda & Essay)
  const existingSoal = await prisma.soal.findFirst({
    where: { ulanganId: ulangan.id },
  });

  if (!existingSoal) {
    await prisma.soal.createMany({
      data: [
        {
          ulanganId: ulangan.id,
          tipe: 'PG',
          pertanyaan:
            'Protokol apa yang digunakan untuk mentransfer halaman web secara aman (terenkripsi)?',
          opsiA: 'HTTP',
          opsiB: 'HTTPS',
          opsiC: 'FTP',
          opsiD: 'SMTP',
          jawabanBenar: 'B',
          bobot: 50,
        },
        {
          ulanganId: ulangan.id,
          tipe: 'ESSAY',
          pertanyaan:
            'Jelaskan perbedaan mendasar antara frontend dan backend dalam pengembangan aplikasi web!',
          bobot: 50,
        },
      ],
    });
    console.log('✅ Soal PG & Essay siap');
  }

  console.log('🎉 Seeding data berhasil diselesaikan!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
