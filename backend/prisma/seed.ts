import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/ulangan_siswa?schema=public',
});
const prisma = new PrismaClient({ adapter });

// Helper untuk membaca data terkompresi dari file PostgreSQL custom backup
function extractChunksFromBackup(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File backup tidak ditemukan di ${filePath}`);
    return [];
  }

  const buf = fs.readFileSync(filePath);
  const chunks: string[] = [];
  let pos = 0;

  while (pos < buf.length - 2) {
    if (
      buf[pos] === 0x78 &&
      (buf[pos + 1] === 0x9c ||
        buf[pos + 1] === 0x01 ||
        buf[pos + 1] === 0xda ||
        buf[pos + 1] === 0x5e)
    ) {
      try {
        const decomp = zlib.inflateSync(buf.slice(pos));
        chunks.push(decomp.toString('utf8'));
      } catch (e) {
        // Abaikan jika bukan chunk zlib valid
      }
    }
    pos++;
  }

  return chunks;
}

function parseTSV(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('\\.'))
    .map((line) => line.split('\t'));
}

async function main() {
  console.log('🚀 Memulai proses Restore & Seeding Database CBT Online...');

  const backupPath = path.join(__dirname, '../ulangan_siswa.backup');
  const chunks = extractChunksFromBackup(backupPath);

  // Default Password Hash
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const siswaPasswordHash = await bcrypt.hash('siswa123', 10);

  // ==========================================
  // 1. RESTORE KELAS DARI BACKUP
  // ==========================================
  const kelasMap = new Map<number, number>(); // oldId -> newId

  // Kelas default untuk testing
  const defaultKelas = await prisma.kelas.upsert({
    where: { kode: 'XII-RPL-1' },
    update: {},
    create: {
      kode: 'XII-RPL-1',
      nama: 'XII RPL 1',
    },
  });
  console.log('✅ Kelas default dibuat: XII RPL 1');

  if (chunks.length > 3) {
    const rawKelas = parseTSV(chunks[3]);
    for (const row of rawKelas) {
      const oldId = parseInt(row[0], 10);
      const kode = row[1];
      const nama = row[2];

      const k = await prisma.kelas.upsert({
        where: { kode },
        update: { nama },
        create: { kode, nama },
      });
      kelasMap.set(oldId, k.id);
    }
    console.log(`✅ Berhasil merestore ${rawKelas.length} Kelas dari backup`);
  }

  // ==========================================
  // 2. RESTORE SISWA DARI BACKUP (35 SISWA)
  // ==========================================
  const siswaMap = new Map<number, number>(); // oldId -> newId

  if (chunks.length > 5) {
    const rawSiswa = parseTSV(chunks[5]);
    for (const row of rawSiswa) {
      const oldId = parseInt(row[0], 10);
      const nis = row[1];
      const nama = row[2];
      const jk = row[3] || 'L';
      const oldKelasId = parseInt(row[4], 10);
      const kelasId = kelasMap.get(oldKelasId) || defaultKelas.id;

      const s = await prisma.siswa.upsert({
        where: { nis },
        update: { nama, jk, kelasId },
        create: { nis, nama, jk, kelasId },
      });
      siswaMap.set(oldId, s.id);
    }
    console.log(`✅ Berhasil merestore ${rawSiswa.length} Siswa dari backup`);
  }

  // ==========================================
  // 3. RESTORE ULANGAN DARI BACKUP (5 ULANGAN)
  // ==========================================
  const ulanganMap = new Map<number, number>(); // oldId -> newId

  if (chunks.length > 7) {
    const rawUlangan = parseTSV(chunks[7]);
    for (const row of rawUlangan) {
      const oldId = parseInt(row[0], 10);
      const kode = row[1];
      const judul = row[2];
      const deskripsi = row[3] === '\\N' ? null : row[3];
      const oldKelasId = parseInt(row[4], 10);
      const durasi = parseInt(row[6], 10) || 60;
      const status = row[7] === 't';
      const tanggal = new Date(row[5]) || new Date();

      const u = await prisma.ulangan.upsert({
        where: { kode },
        update: { judul, deskripsi, durasi, status, tanggal },
        create: { kode, judul, deskripsi, durasi, status, tanggal },
      });
      ulanganMap.set(oldId, u.id);

      // Link ke kelas
      const kelasId = kelasMap.get(oldKelasId) || defaultKelas.id;
      await prisma.ulanganKelas.upsert({
        where: {
          ulanganId_kelasId: {
            ulanganId: u.id,
            kelasId,
          },
        },
        update: {},
        create: {
          ulanganId: u.id,
          kelasId,
        },
      });
    }
    console.log(`✅ Berhasil merestore ${rawUlangan.length} Ulangan dari backup`);
  }

  // ==========================================
  // 4. RESTORE SOAL DARI BACKUP (29 SOAL)
  // ==========================================
  if (chunks.length > 6) {
    const rawSoal = parseTSV(chunks[6]);
    let soalCount = 0;

    for (const row of rawSoal) {
      const oldUlanganId = parseInt(row[1], 10);
      const ulanganId = ulanganMap.get(oldUlanganId);

      if (!ulanganId) continue;

      const tipe = row[2];
      const pertanyaan = row[3];
      const gambar = row[4] === '\\N' ? null : row[4];
      const bobot = parseInt(row[5], 10) || 1;
      const opsiA = row[6] === '\\N' ? null : row[6];
      const opsiB = row[7] === '\\N' ? null : row[7];
      const opsiC = row[8] === '\\N' ? null : row[8];
      const opsiD = row[9] === '\\N' ? null : row[9];
      const jawabanBenar = row[10] === '\\N' ? null : row[10];

      // Cek apakah soal sudah ada
      const existing = await prisma.soal.findFirst({
        where: {
          ulanganId,
          pertanyaan,
        },
      });

      if (!existing) {
        await prisma.soal.create({
          data: {
            ulanganId,
            tipe,
            pertanyaan,
            gambar,
            bobot,
            opsiA,
            opsiB,
            opsiC,
            opsiD,
            jawabanBenar,
          },
        });
        soalCount++;
      }
    }
    console.log(`✅ Berhasil merestore ${soalCount} Soal baru dari backup`);
  }

  // ==========================================
  // 5. SEED AKUN UNTUK LOGIN & TESTING
  // ==========================================
  // A. Akun herlambang (ADMIN asli dari backup)
  const siswaHerlambang = await prisma.siswa.findFirst({
    where: { nis: '163400' },
  });

  if (siswaHerlambang) {
    await prisma.akunSiswa.upsert({
      where: { username: 'herlambang' },
      update: {
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: true,
      },
      create: {
        siswaId: siswaHerlambang.id,
        username: 'herlambang',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: true,
      },
    });
    console.log('✅ Akun ADMIN siap: "herlambang" (password: admin123)');
  }

  // B. Akun admin (ADMIN universal)
  const siswaAdmin = await prisma.siswa.upsert({
    where: { nis: 'ADM001' },
    update: { nama: 'Administrator Guru' },
    create: {
      nis: 'ADM001',
      nama: 'Administrator Guru',
      jk: 'L',
      kelasId: defaultKelas.id,
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
  console.log('✅ Akun ADMIN siap: "admin" (password: admin123)');

  // C. Akun dewangga (SISWA asli dari backup)
  const siswaDewangga = await prisma.siswa.findFirst({
    where: { nama: { contains: 'Dewangga', mode: 'insensitive' } },
  });

  if (siswaDewangga) {
    await prisma.akunSiswa.upsert({
      where: { username: 'dewangga' },
      update: {
        passwordHash: siswaPasswordHash,
        role: 'SISWA',
        status: true,
      },
      create: {
        siswaId: siswaDewangga.id,
        username: 'dewangga',
        passwordHash: siswaPasswordHash,
        role: 'SISWA',
        status: true,
      },
    });
    console.log('✅ Akun SISWA siap: "dewangga" (password: siswa123)');
  }

  // D. Akun siswa (SISWA universal untuk testing)
  const siswaBiasa = await prisma.siswa.upsert({
    where: { nis: 'SISWA001' },
    update: { nama: 'Budi Santoso' },
    create: {
      nis: 'SISWA001',
      nama: 'Budi Santoso',
      jk: 'L',
      kelasId: defaultKelas.id,
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
  console.log('✅ Akun SISWA siap: "siswa" (password: siswa123)');

  // ==========================================
  // 6. SEED MATA PELAJARAN & SEMESTER
  // ==========================================
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

  console.log('🎉 SEEDING & RESTORE LENGKAP SELESAI!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat restore/seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
