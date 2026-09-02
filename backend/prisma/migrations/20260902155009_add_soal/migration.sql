-- CreateTable
CREATE TABLE "Soal" (
    "id" SERIAL NOT NULL,
    "ulanganId" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "gambar" TEXT,
    "bobot" INTEGER NOT NULL DEFAULT 1,
    "opsiA" TEXT,
    "opsiB" TEXT,
    "opsiC" TEXT,
    "opsiD" TEXT,
    "jawabanBenar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_ulanganId_fkey" FOREIGN KEY ("ulanganId") REFERENCES "Ulangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
