-- =========================================================
-- MIGRATION: Ulangan 1 Ulangan Bisa Banyak Kelas
-- Aman untuk data Ulangan yang sudah ada
-- =========================================================

-- 1. Buat tabel penghubung terlebih dahulu
CREATE TABLE "UlanganKelas" (
    "id" SERIAL NOT NULL,
    "ulanganId" INTEGER NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UlanganKelas_pkey" PRIMARY KEY ("id")
);

-- 2. Buat index
CREATE INDEX "UlanganKelas_ulanganId_idx"
ON "UlanganKelas"("ulanganId");

CREATE INDEX "UlanganKelas_kelasId_idx"
ON "UlanganKelas"("kelasId");

-- 3. Hindari duplikasi Ulangan + Kelas
CREATE UNIQUE INDEX "UlanganKelas_ulanganId_kelasId_key"
ON "UlanganKelas"("ulanganId", "kelasId");

-- 4. PINDAHKAN DATA LAMA
--    Ulangan.kelasId -> UlanganKelas
INSERT INTO "UlanganKelas" (
    "ulanganId",
    "kelasId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "kelasId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Ulangan"
WHERE "kelasId" IS NOT NULL;

-- 5. Setelah data lama aman, hapus foreign key lama
ALTER TABLE "Ulangan"
DROP CONSTRAINT "Ulangan_kelasId_fkey";

-- 6. Baru hapus kolom kelasId lama
ALTER TABLE "Ulangan"
DROP COLUMN "kelasId";

-- 7. Foreign key UlanganKelas -> Ulangan
ALTER TABLE "UlanganKelas"
ADD CONSTRAINT "UlanganKelas_ulanganId_fkey"
FOREIGN KEY ("ulanganId")
REFERENCES "Ulangan"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 8. Foreign key UlanganKelas -> Kelas
ALTER TABLE "UlanganKelas"
ADD CONSTRAINT "UlanganKelas_kelasId_fkey"
FOREIGN KEY ("kelasId")
REFERENCES "Kelas"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;