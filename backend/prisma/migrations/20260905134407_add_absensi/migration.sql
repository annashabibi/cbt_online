-- CreateTable
CREATE TABLE "MataPelajaran" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataPelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsensiPertemuan" (
    "id" SERIAL NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "mataPelajaranId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "pertemuanKe" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsensiPertemuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsensiSiswa" (
    "id" SERIAL NOT NULL,
    "absensiPertemuanId" INTEGER NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsensiSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MataPelajaran_kode_key" ON "MataPelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_tahunAjaran_semester_key" ON "Semester"("tahunAjaran", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "AbsensiPertemuan_kelasId_mataPelajaranId_semesterId_pertemu_key" ON "AbsensiPertemuan"("kelasId", "mataPelajaranId", "semesterId", "pertemuanKe");

-- CreateIndex
CREATE UNIQUE INDEX "AbsensiSiswa_absensiPertemuanId_siswaId_key" ON "AbsensiSiswa"("absensiPertemuanId", "siswaId");

-- AddForeignKey
ALTER TABLE "AbsensiPertemuan" ADD CONSTRAINT "AbsensiPertemuan_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiPertemuan" ADD CONSTRAINT "AbsensiPertemuan_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "MataPelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiPertemuan" ADD CONSTRAINT "AbsensiPertemuan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiSiswa" ADD CONSTRAINT "AbsensiSiswa_absensiPertemuanId_fkey" FOREIGN KEY ("absensiPertemuanId") REFERENCES "AbsensiPertemuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiSiswa" ADD CONSTRAINT "AbsensiSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
