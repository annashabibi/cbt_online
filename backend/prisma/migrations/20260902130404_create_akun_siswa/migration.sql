-- CreateTable
CREATE TABLE "AkunSiswa" (
    "id" SERIAL NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AkunSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AkunSiswa_siswaId_key" ON "AkunSiswa"("siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "AkunSiswa_username_key" ON "AkunSiswa"("username");

-- AddForeignKey
ALTER TABLE "AkunSiswa" ADD CONSTRAINT "AkunSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
