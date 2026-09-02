-- CreateTable
CREATE TABLE "PesertaUjian" (
    "id" SERIAL NOT NULL,
    "ulanganId" INTEGER NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "mulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selesai" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'MENGERJAKAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PesertaUjian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JawabanSiswa" (
    "id" SERIAL NOT NULL,
    "pesertaUjianId" INTEGER NOT NULL,
    "soalId" INTEGER NOT NULL,
    "jawaban" TEXT,
    "nilai" INTEGER NOT NULL DEFAULT 0,
    "dinilai" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JawabanSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilUjian" (
    "id" SERIAL NOT NULL,
    "pesertaUjianId" INTEGER NOT NULL,
    "nilaiPG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiEssay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'BELUM_FINAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HasilUjian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PesertaUjian_ulanganId_siswaId_key" ON "PesertaUjian"("ulanganId", "siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "JawabanSiswa_pesertaUjianId_soalId_key" ON "JawabanSiswa"("pesertaUjianId", "soalId");

-- CreateIndex
CREATE UNIQUE INDEX "HasilUjian_pesertaUjianId_key" ON "HasilUjian"("pesertaUjianId");

-- AddForeignKey
ALTER TABLE "PesertaUjian" ADD CONSTRAINT "PesertaUjian_ulanganId_fkey" FOREIGN KEY ("ulanganId") REFERENCES "Ulangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaUjian" ADD CONSTRAINT "PesertaUjian_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanSiswa" ADD CONSTRAINT "JawabanSiswa_pesertaUjianId_fkey" FOREIGN KEY ("pesertaUjianId") REFERENCES "PesertaUjian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanSiswa" ADD CONSTRAINT "JawabanSiswa_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilUjian" ADD CONSTRAINT "HasilUjian_pesertaUjianId_fkey" FOREIGN KEY ("pesertaUjianId") REFERENCES "PesertaUjian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
