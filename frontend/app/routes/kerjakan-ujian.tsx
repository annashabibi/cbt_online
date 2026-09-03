import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "../config/api";

type Soal = {
  id: number;
  tipe: string;
  pertanyaan: string;
  gambar: string | null;
  bobot: number;
  opsiA: string | null;
  opsiB: string | null;
  opsiC: string | null;
  opsiD: string | null;
};

type Ulangan = {
  id: number;
  kode: string;
  judul: string;
  deskripsi: string | null;
  tanggal: string;
  durasi: number;
  kelas: {
    id: number;
    kode: string;
    nama: string;
  };
  soal: Soal[];
};

type Jawaban = {
  [soalId: number]: string;
};

type JawabanDatabase = {
  id: number;
  soalId: number;
  jawaban: string | null;
};

type PesertaUjian = {
  id: number;
  ulanganId: number;
  siswaId: number;
  mulai: string;
  selesai: string | null;
  status: string;
  jawaban: JawabanDatabase[];
};

export default function KerjakanUjian() {
  const { id } = useParams();
  const navigate = useNavigate();

const [ulangan, setUlangan] = useState<Ulangan | null>(null);
const [jawaban, setJawaban] = useState<Jawaban>({});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState<number | null>(null);
const [peserta, setPeserta] = useState<any>(null);

const [sisaWaktu, setSisaWaktu] = useState<number | null>(null);
const [submitting, setSubmitting] = useState(false);
const [showModalSelesai, setShowModalSelesai] = useState(false);


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadUjian();
  }, [id]);

  const loadUjian = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!id) {
        throw new Error(
          "ID ujian tidak ditemukan",
        );
      }


      // =====================================================
      // 1. GET DETAIL ULANGAN
      // =====================================================

// =====================================================
// 1. GET DETAIL ULANGAN
// =====================================================

const ulanganResponse = await fetch(
  `${API_URL}/ulangan/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const ulanganResult =
  await ulanganResponse.json();

if (!ulanganResponse.ok) {
  throw new Error(
    Array.isArray(ulanganResult.message)
      ? ulanganResult.message.join(", ")
      : ulanganResult.message ||
          "Gagal mengambil data ujian",
  );
}

// =====================================================
// 2. GET SOAL KHUSUS SISWA
// =====================================================

const soalResponse = await fetch(
  `${API_URL}/soal/ujian/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const soalResult = await soalResponse.json();

if (!soalResponse.ok) {
  throw new Error(
    Array.isArray(soalResult.message)
      ? soalResult.message.join(", ")
      : soalResult.message ||
          "Gagal mengambil soal ujian",
  );
}

setUlangan({
  ...ulanganResult,
  soal: soalResult,
});

      // =====================================================
      // 2. GET PESERTA UJIAN MILIK SISWA
      // =====================================================

      const pesertaResponse = await fetch(
    `${API_URL}/peserta-ujian/saya/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // =========================================================
// TIMER UJIAN
// =========================================================


      const pesertaResult =
        await pesertaResponse.json();

      if (!pesertaResponse.ok) {
        throw new Error(
          Array.isArray(pesertaResult.message)
            ? pesertaResult.message.join(", ")
            : pesertaResult.message ||
                "Gagal mengambil peserta ujian",
        );
      }


// =====================================================
// 3. PESERTA UJIAN
// =====================================================

const pesertaSekarang =
  pesertaResult as PesertaUjian;

if (!pesertaSekarang) {
  toast.error("Peserta ujian belum ditemukan");

  navigate("/ujian");
  return;
}

      setPeserta(pesertaSekarang);

      // =====================================================
      // 4. CEK STATUS
      // =====================================================

      if (
        pesertaSekarang.status ===
        "SELESAI"
      ) {
        toast.info(
          "Ujian ini sudah selesai.",
        );

        navigate("/ujian");
        return;
      }

      // =====================================================
      // 5. LOAD JAWABAN LAMA
      // =====================================================

      const jawabanDariDatabase: Jawaban = {};

      if (pesertaSekarang.jawaban) {
        pesertaSekarang.jawaban.forEach(
          (item: JawabanDatabase) => {
            if (
              item.jawaban !== null &&
              item.jawaban !== ""
            ) {
              jawabanDariDatabase[
                item.soalId
              ] = item.jawaban;
            }
          },
        );
      }

      setJawaban(jawabanDariDatabase);
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

  
useEffect(() => {
  if (!peserta || !ulangan) return;

  const updateTimer = () => {
    const waktuMulai = new Date(peserta.mulai).getTime();

    const durasiMs = ulangan.durasi * 60 * 1000;

    const waktuSelesai = waktuMulai + durasiMs;

    const sekarang = Date.now();

    const sisa = Math.max(
      0,
      Math.floor((waktuSelesai - sekarang) / 1000),
    );

    setSisaWaktu(sisa);

    if (sisa <= 0) {
      selesaiUjianOtomatis();
    }
  };

  updateTimer();

  const interval = setInterval(updateTimer, 1000);

  return () => clearInterval(interval);
}, [peserta, ulangan]);

  // =========================================================
  // SIMPAN JAWABAN
  // =========================================================

  const handleJawaban = async (
    soalId: number,
    value: string,
  ) => {
    // Update UI langsung
    setJawaban((prev) => ({
      ...prev,
      [soalId]: value,
    }));

    try {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        toast.error(
          "Token login tidak ditemukan",
        );

        navigate("/login");
        return;
      }

      if (!peserta) {
        toast.error(
          "Peserta ujian belum ditemukan",
        );
        return;
      }

      if (
        peserta.status !==
        "MENGERJAKAN"
      ) {
        toast.error(
          "Ujian sudah selesai.",
        );
        return;
      }

      setSaving(soalId);

      const response = await fetch(
        `${API_URL}/jawaban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pesertaUjianId: peserta.id,
            soalId,
            jawaban: value,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message ||
                "Gagal menyimpan jawaban",
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan jawaban",
      );
    } finally {
      setSaving(null);
    }
  };

  // =========================================================
  // BUKA MODAL SELESAI
  // =========================================================

  const bukaModalSelesai = () => {
    setShowModalSelesai(true);
  };

  // =========================================================
  // TUTUP MODAL
  // =========================================================

  const tutupModalSelesai = () => {
    if (submitting) {
      return;
    }

    setShowModalSelesai(false);
  };

  // =========================================================
  // SELESAIKAN UJIAN
  // =========================================================

  const selesaiUjianOtomatis = async () => {
  if (!peserta || submitting) return;

  try {
    setSubmitting(true);

    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await fetch(
      `${API_URL}/peserta-ujian/${peserta.id}/selesai`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message ||
              "Gagal menyelesaikan ujian",
      );
    }

    setPeserta((prev: PesertaUjian | null) =>
      prev
        ? {
            ...prev,
            status: "SELESAI",
            selesai:
              result.selesai ??
              new Date().toISOString(),
          }
        : prev,
    );

    toast.info("Waktu ujian telah habis.");

    navigate("/ujian");
  } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Gagal menyelesaikan ujian",
    );
  } finally {
    setSubmitting(false);
  }
};

  const selesaiUjian = async () => {
    try {
      if (!peserta) {
        toast.error(
          "Peserta ujian tidak ditemukan",
        );
        return;
      }

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        toast.error(
          "Token login tidak ditemukan",
        );

        navigate("/login");
        return;
      }

      setSubmitting(true);

      // =====================================================
      // PATCH STATUS SELESAI
      // =====================================================

      const response = await fetch(
        `${API_URL}/peserta-ujian/${peserta.id}/selesai`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message ||
                "Gagal menyelesaikan ujian",
        );
      }
// =====================================================
// HITUNG NILAI DAN BUAT HASIL UJIAN
// =====================================================

const hasilResponse = await fetch(
  `${API_URL}/hasil/hitung/${peserta.id}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const hasilResult = await hasilResponse.json();

if (!hasilResponse.ok) {
  throw new Error(
    Array.isArray(hasilResult.message)
      ? hasilResult.message.join(", ")
      : hasilResult.message ||
          "Gagal menghitung nilai ujian",
  );
}
      // Update state peserta

  setPeserta((prev: PesertaUjian | null) =>
    prev
      ? {
          ...prev,
          status: "SELESAI",
          selesai:
            result.selesai ??
            new Date().toISOString(),
        }
      : prev,
  );

  setShowModalSelesai(false);

        toast.success(
          "Ujian berhasil diselesaikan",
        );

        // =====================================================
        // KEMBALI KE UJIAN SAYA
        // =====================================================

        navigate("/ujian");
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal menyelesaikan ujian",
        );
      } finally {
        setSubmitting(false);
      }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-gray-500">
            Memuat ujian...
          </p>
        </div>
      );
    }

    // =========================================================
    // DATA TIDAK ADA
    // =========================================================

    if (!ulangan || !peserta) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Data ujian tidak ditemukan.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/ujian")
            }
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      );
    }

    // =========================================================
    // PROGRESS
    // =========================================================

    const jumlahTerjawab =
      Object.keys(jawaban).length;

    const jumlahSoal =
      ulangan.soal.length;

    const progress =
      jumlahSoal > 0
        ? Math.round(
            (jumlahTerjawab / jumlahSoal) *
              100,
          )
        : 0;

        const formatWaktu = (detik: number | null) => {
    if (detik === null) return "--:--";

    const menit = Math.floor(detik / 60);
    const detikSisa = detik % 60;

    return `${String(menit).padStart(2, "0")}:${String(
      detikSisa,
    ).padStart(2, "0")}`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-white/20 p-3">
            <FileText className="h-7 w-7" />
          </div>

          <div className="flex-1">

            <p className="text-sm text-blue-100">
              {ulangan.kode}
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {ulangan.judul}
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              {ulangan.kelas.kode} -{" "}
              {ulangan.kelas.nama}
            </p>

          </div>
        </div>

        {/* INFO */}

        <div className="mt-5 flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <Clock className="h-4 w-4" />
            {ulangan.durasi} menit
          </div>

          <div
  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
    sisaWaktu !== null && sisaWaktu <= 300
      ? "bg-red-500 text-white"
      : "bg-white/10 text-white"
  }`}
>
  <Clock className="h-4 w-4" />
  Waktu tersisa: {formatWaktu(sisaWaktu)}
</div>

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <FileText className="h-4 w-4" />
            {jumlahSoal} soal
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            {jumlahTerjawab} terjawab
          </div>

        </div>

        {/* PROGRESS BAR */}

        <div className="mt-5">

          <div className="mb-2 flex justify-between text-xs text-blue-100">
            <span>
              Progress pengerjaan
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>
      </div>

      {/* =====================================================
          SOAL
          ===================================================== */}

      <div className="space-y-5">

        {ulangan.soal.map(
          (soal, index) => {

            const currentAnswer =
              jawaban[soal.id] || "";

            return (
              <div
                key={soal.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                <div className="flex items-start gap-4">

                  {/* NOMOR SOAL */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {index + 1}
                  </div>

                  <div className="flex-1">

                    {/* HEADER SOAL */}

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-xs font-medium uppercase text-gray-400">
                        {soal.tipe}
                      </span>

                      <span className="text-xs text-gray-400">
                        Bobot: {soal.bobot}
                      </span>

                    </div>

                    {/* PERTANYAAN */}

                    <p className="mt-3 text-base font-medium leading-7 text-gray-900">
                      {soal.pertanyaan}
                    </p>

                    {/* GAMBAR */}

                    {soal.gambar && (
                      <img
                        src={soal.gambar}
                        alt="Gambar soal"
                        className="mt-4 max-h-72 rounded-xl border object-contain"
                      />
                    )}

                    {/* =================================================
                        PILIHAN GANDA
                        ================================================= */}

                  {soal.tipe === "PG" && (
  <div className="mt-5 space-y-3">
    {(
      [
        ["A", soal.opsiA],
        ["B", soal.opsiB],
        ["C", soal.opsiC],
        ["D", soal.opsiD],
      ] as [string, string | null][]
    ).map(([label, text]) => {
      if (!text) {
        return null;
      }

      const selected = currentAnswer === label;

      return (
        <label
          key={label}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
            selected
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name={`soal-${soal.id}`}
            value={label}
            checked={selected}
            onChange={(e) =>
              handleJawaban(soal.id, e.target.value)
            }
            className="h-4 w-4"
          />

          <span className="font-semibold text-gray-700">
            {label}.
          </span>

          <span className="text-gray-700">
            {text}
          </span>
        </label>
      );
    })}
  </div>
)}
                    {/* =================================================
                        ESSAY
                        ================================================= */}

                    {soal.tipe ===
                      "ESSAY" && (
                      <div className="mt-5">

                        <textarea
                          value={
                            currentAnswer
                          }
                          onChange={(e) =>
                            setJawaban(
                              (prev) => ({
                                ...prev,
                                [soal.id]:
                                  e.target
                                    .value,
                              }),
                            )
                          }
                          onBlur={(e) =>
                            handleJawaban(
                              soal.id,
                              e.target.value,
                            )
                          }
                          rows={5}
                          placeholder="Tulis jawaban kamu di sini..."
                          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs text-gray-400">
                          Jawaban essay akan
                          disimpan saat kamu
                          selesai mengisi.
                        </p>

                      </div>
                    )}

                    {/* STATUS */}

                    {saving === soal.id && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

                        Menyimpan jawaban...
                      </div>
                    )}

                    {currentAnswer &&
                      saving !== soal.id && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle className="h-4 w-4" />

                          Jawaban tersimpan
                        </div>
                      )}

                  </div>
                </div>
              </div>
            );
          },
        )}

      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="sticky bottom-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* KIRI */}

          <div>

            <p className="text-sm font-semibold text-gray-800">
              Progress pengerjaan
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {jumlahTerjawab} dari{" "}
              {jumlahSoal} soal sudah
              dijawab
            </p>

          </div>

          {/* KANAN */}

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/ujian")
              }
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />

              Kembali
            </button>

            <button
              type="button"
              onClick={
                bukaModalSelesai
              }
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />

              Selesai Ujian
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL KONFIRMASI
          ===================================================== */}

      {showModalSelesai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* HEADER MODAL */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <h2 className="text-lg font-bold text-gray-900">
                Selesaikan Ujian?
              </h2>

              <button
                type="button"
                onClick={
                  tutupModalSelesai
                }
                disabled={submitting}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6">

              <div className="flex gap-4 rounded-xl bg-orange-50 p-4">

                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />

                <div>

                  <p className="font-semibold text-orange-800">
                    Periksa kembali jawaban
                    kamu.
                  </p>

                  <p className="mt-1 text-sm text-orange-700">
                    Kamu sudah menjawab{" "}
                    <strong>
                      {jumlahTerjawab}
                    </strong>{" "}
                    dari{" "}
                    <strong>
                      {jumlahSoal}
                    </strong>{" "}
                    soal.
                  </p>

                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-600">
                Setelah ujian diselesaikan,
                kamu tidak dapat mengubah
                jawaban lagi.
              </p>

            </div>

            {/* FOOTER MODAL */}

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

              <button
                type="button"
                onClick={
                  tutupModalSelesai
                }
                disabled={submitting}
                className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={selesaiUjian}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Menyelesaikan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />

                    Ya, Selesaikan
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}