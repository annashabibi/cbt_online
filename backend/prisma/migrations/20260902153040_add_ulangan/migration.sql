-- CreateTable
CREATE TABLE "Ulangan" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kelasId" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "durasi" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ulangan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ulangan_kode_key" ON "Ulangan"("kode");

-- AddForeignKey
ALTER TABLE "Ulangan" ADD CONSTRAINT "Ulangan_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
