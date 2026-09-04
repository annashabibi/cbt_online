import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "../config/api";
type Ulangan = {
  id: number;
  kode: string;
  judul: string;
  deskripsi: string | null;
  kelasId: number;
  tanggal: string;
  durasi: number;
  status: boolean;
  kelas: {
    id: number;
    kode: string;
    nama: string;
  };
  soal: {
    id: number;
  }[];
};

type PesertaUjian = {
  id: number;
  ulanganId: number;
  siswaId: number;
  mulai: string;
  selesai: string | null;
  status: "MENGERJAKAN" | "SELESAI" | string;
};

export default function Ujian() {
  const navigate = useNavigate();

  const [data, setData] = useState<Ulangan[]>([]);
  const [pesertaData, setPesertaData] = useState<PesertaUjian[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUjianId, setLoadingUjianId] = useState<number | null>(
    null,
  );

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      // =====================================================
      // AMBIL ULANGAN MILIK KELAS SISWA
      // =====================================================

      const ulanganResponse = await fetch(
        `${API_URL}/ulangan/saya`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const ulanganResult = await ulanganResponse.json();

      if (!ulanganResponse.ok) {
        throw new Error(
          Array.isArray(ulanganResult.message)
            ? ulanganResult.message.join(", ")
            : ulanganResult.message ||
                "Gagal mengambil data ulangan",
        );
      }

      // =====================================================
      // AMBIL PESERTA UJIAN MILIK SISWA
      // =====================================================

      const pesertaResponse = await fetch(
        `${API_URL}/peserta-ujian/saya`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const pesertaResult = await pesertaResponse.json();

      if (!pesertaResponse.ok) {
        throw new Error(
          Array.isArray(pesertaResult.message)
            ? pesertaResult.message.join(", ")
            : pesertaResult.message ||
                "Gagal mengambil status ujian",
        );
      }

      setData(ulanganResult);
      setPesertaData(pesertaResult);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data ujian",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // CARI PESERTA BERDASARKAN ULANGAN
  // =========================================================

  const getPeserta = (ulanganId: number) => {
    return pesertaData.find(
      (item) => item.ulanganId === ulanganId,
    );
  };

  // =========================================================
  // MULAI / LANJUTKAN UJIAN
  // =========================================================

  const mulaiUjian = async (ulanganId: number) => {
    try {
      setLoadingUjianId(ulanganId);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Token login tidak ditemukan");
        navigate("/login");
        return;
      }

      // =====================================================
      // BUAT / AMBIL PESERTA UJIAN
      // =====================================================

      const response = await fetch(
        `${API_URL}/peserta-ujian`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ulanganId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message ||
                "Gagal memulai ujian",
        );
      }

      const pesertaId = result.id;

      if (!pesertaId) {
        throw new Error(
          "ID peserta ujian tidak ditemukan",
        );
      }

      // =====================================================
      // MULAI / LANJUTKAN PESERTA
      // =====================================================

      const mulaiResponse = await fetch(
        `${API_URL}/peserta-ujian/${pesertaId}/mulai`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const mulaiResult =
        await mulaiResponse.json();

      if (!mulaiResponse.ok) {
        throw new Error(
          Array.isArray(mulaiResult.message)
            ? mulaiResult.message.join(", ")
            : mulaiResult.message ||
                "Gagal memulai ujian",
        );
      }

      // =====================================================
      // UPDATE DATA PESERTA DI FRONTEND
      // =====================================================

      setPesertaData((prev) => {
        const existing = prev.find(
          (item) => item.ulanganId === ulanganId,
        );

        if (existing) {
          return prev.map((item) =>
            item.ulanganId === ulanganId
              ? {
                  ...item,
                  ...mulaiResult,
                }
              : item,
          );
        }

        return [
          ...prev,
          mulaiResult,
        ];
      });

      toast.success(
        "Ujian siap dikerjakan",
      );

      // =====================================================
      // MASUK KE HALAMAN PENGERJAAN
      // =====================================================

      navigate(`/ujian/${ulanganId}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memulai ujian",
      );
    } finally {
      setLoadingUjianId(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-5 pb-24 sm:space-y-6 md:pb-0">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Ujian Saya
        </h1>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Daftar ulangan yang tersedia untuk kelas kamu.
        </p>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500 sm:text-base">
            Memuat daftar ujian...
          </p>
        </div>
      ) : data.length === 0 ? (
        /* ===================================================
           EMPTY
           =================================================== */

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-7 w-7 text-gray-400" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-gray-800 sm:text-lg">
            Belum ada ujian
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Saat ini belum ada ulangan yang tersedia
            untuk kelas kamu.
          </p>
        </div>
      ) : (
        /* ===================================================
           LIST UJIAN
           =================================================== */

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => {
            const peserta = getPeserta(item.id);

            const sudahMulai =
              peserta?.status === "MENGERJAKAN";

            const sudahSelesai =
              peserta?.status === "SELESAI";

            const sedangLoading =
              loadingUjianId === item.id;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition active:scale-[0.99] sm:hover:-translate-y-1 sm:hover:shadow-md"
              >
                {/* =========================================
                    CARD HEADER
                    ========================================= */}

                <div
                  className={`p-4 text-white sm:p-5 ${
                    sudahSelesai
                      ? "bg-gray-600"
                      : sudahMulai
                        ? "bg-orange-500"
                        : "bg-blue-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                        {item.kode}
                      </p>

                      <h2 className="mt-1 break-words text-lg font-bold leading-snug sm:text-xl">
                        {item.judul}
                      </h2>
                    </div>

                    <div className="shrink-0 rounded-xl bg-white/20 p-2">
                      {sudahSelesai ? (
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : sudahMulai ? (
                        <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>
                  </div>
                </div>

                {/* =========================================
                    CARD BODY
                    ========================================= */}

                <div className="space-y-4 p-4 sm:p-5">
                  {/* STATUS */}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-500">
                      Status
                    </span>

                    {sudahSelesai ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Selesai
                      </span>
                    ) : sudahMulai ? (
                      <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        Sedang Dikerjakan
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Belum Dikerjakan
                      </span>
                    )}
                  </div>

                  {/* KELAS */}

                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-blue-50 p-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Kelas
                      </p>

                      <p className="break-words font-medium text-gray-800">
                        {item.kelas.nama}
                      </p>
                    </div>
                  </div>

                  {/* WAKTU */}

                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-orange-50 p-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Jadwal
                      </p>

                      <p className="break-words font-medium text-gray-800">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>
                  </div>

                  {/* DURASI + SOAL */}

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="text-gray-500">
                        Durasi
                      </span>

                      <span className="font-semibold text-gray-800">
                        {item.durasi} menit
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-2 text-sm">
                      <span className="text-gray-500">
                        Jumlah Soal
                      </span>

                      <span className="font-semibold text-gray-800">
                        {item.soal.length} soal
                      </span>
                    </div>
                  </div>

                  {/* DESKRIPSI */}

                  {item.deskripsi && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Deskripsi
                      </p>

                      <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
                        {item.deskripsi}
                      </p>
                    </div>
                  )}

                  {/* =======================================
                      BUTTON
                      ======================================= */}

                  {sudahSelesai ? (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-500 sm:text-base"
                    >
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <span>Ujian Sudah Selesai</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        mulaiUjian(item.id)
                      }
                      disabled={sedangLoading}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${
                        sudahMulai
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {sedangLoading ? (
                        <>
                          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          <span>Memproses...</span>
                        </>
                      ) : sudahMulai ? (
                        <>
                          <RotateCcw className="h-5 w-5 shrink-0" />
                          <span>Lanjutkan Ujian</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-5 w-5 shrink-0" />
                          <span>Mulai Ujian</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
