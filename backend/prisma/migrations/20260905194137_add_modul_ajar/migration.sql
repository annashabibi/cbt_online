-- CreateTable
CREATE TABLE "ModulAjar" (
    "id" SERIAL NOT NULL,
    "namaPenyusun" TEXT NOT NULL,
    "programKeahlian" TEXT,
    "judulElemen" TEXT,
    "capaianPembelajaran" TEXT,
    "kelasId" INTEGER NOT NULL,
    "mataPelajaranId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "pengayaan" TEXT,
    "remedial" TEXT,
    "refleksiPesertaDidik" TEXT,
    "refleksiGuru" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulAjar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TujuanPembelajaran" (
    "id" SERIAL NOT NULL,
    "modulAjarId" INTEGER NOT NULL,
    "tujuan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TujuanPembelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KegiatanPembelajaran" (
    "id" SERIAL NOT NULL,
    "modulAjarId" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "durasi" INTEGER,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KegiatanPembelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asesmen" (
    "id" SERIAL NOT NULL,
    "modulAjarId" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asesmen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TujuanPembelajaran_modulAjarId_idx" ON "TujuanPembelajaran"("modulAjarId");

-- CreateIndex
CREATE INDEX "KegiatanPembelajaran_modulAjarId_idx" ON "KegiatanPembelajaran"("modulAjarId");

-- CreateIndex
CREATE INDEX "Asesmen_modulAjarId_idx" ON "Asesmen"("modulAjarId");

-- AddForeignKey
ALTER TABLE "ModulAjar" ADD CONSTRAINT "ModulAjar_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulAjar" ADD CONSTRAINT "ModulAjar_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "MataPelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulAjar" ADD CONSTRAINT "ModulAjar_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TujuanPembelajaran" ADD CONSTRAINT "TujuanPembelajaran_modulAjarId_fkey" FOREIGN KEY ("modulAjarId") REFERENCES "ModulAjar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KegiatanPembelajaran" ADD CONSTRAINT "KegiatanPembelajaran_modulAjarId_fkey" FOREIGN KEY ("modulAjarId") REFERENCES "ModulAjar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asesmen" ADD CONSTRAINT "Asesmen_modulAjarId_fkey" FOREIGN KEY ("modulAjarId") REFERENCES "ModulAjar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
