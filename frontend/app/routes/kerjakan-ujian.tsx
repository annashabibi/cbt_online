import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3000";

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

export default function KerjakanUjian() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ulangan, setUlangan] = useState<Ulangan | null>(null);
  const [jawaban, setJawaban] = useState<Jawaban>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    loadUjian();
  }, [id]);

  const loadUjian = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!id) {
        throw new Error("ID ujian tidak ditemukan");
      }

      const response = await fetch(`${API_URL}/ulangan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data ujian",
        );
      }

      setUlangan(result);
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

  const handleJawaban = async (
    soalId: number,
    value: string,
  ) => {
    setJawaban((prev) => ({
      ...prev,
      [soalId]: value,
    }));

    try {
      const token = localStorage.getItem("accessToken");

      const pesertaResponse = await fetch(
        `${API_URL}/peserta-ujian`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const pesertaData = await pesertaResponse.json();

      const peserta = pesertaData.find(
        (item: any) => item.ulanganId === Number(id),
      );

      if (!peserta) {
        toast.error("Peserta ujian belum ditemukan");
        return;
      }

      setSaving(soalId);

      const response = await fetch(`${API_URL}/jawaban`, {
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
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan jawaban",
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

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-500">
          Memuat ujian...
        </p>
      </div>
    );
  }

  if (!ulangan) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-500">
          Data ujian tidak ditemukan.
        </p>

        <button
          type="button"
          onClick={() => navigate("/ujian")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/20 p-3">
            <FileText className="h-7 w-7" />
          </div>

          <div>
            <p className="text-sm text-blue-100">
              {ulangan.kode}
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {ulangan.judul}
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              {ulangan.kelas.kode} - {ulangan.kelas.nama}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <Clock className="h-4 w-4" />
            {ulangan.durasi} menit
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <FileText className="h-4 w-4" />
            {ulangan.soal.length} soal
          </div>
        </div>
      </div>

      {/* SOAL */}
      <div className="space-y-5">
        {ulangan.soal.map((soal, index) => {
          const currentAnswer = jawaban[soal.id] || "";

          return (
            <div
              key={soal.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* NOMOR SOAL */}
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {index + 1}
                </div>

                <div className="flex-1">
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

                  {/* PILIHAN GANDA */}
                  {soal.tipe === "PG" && (
                    <div className="mt-5 space-y-3">
                      {[
                        ["A", soal.opsiA],
                        ["B", soal.opsiB],
                        ["C", soal.opsiC],
                        ["D", soal.opsiD],
                      ].map(([label, text]) => {
                        if (!text) return null;

                        const selected =
                          currentAnswer === label;

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
                                handleJawaban(
                                  soal.id,
                                  e.target.value,
                                )
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

                  {/* ESSAY */}
                  {soal.tipe === "ESSAY" && (
                    <div className="mt-5">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) =>
                          setJawaban((prev) => ({
                            ...prev,
                            [soal.id]: e.target.value,
                          }))
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
                        Jawaban akan disimpan ketika kamu selesai mengisi.
                      </p>
                    </div>
                  )}

                  {/* STATUS SIMPAN */}
                  {saving === soal.id && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                      Menyimpan jawaban...
                    </div>
                  )}

                  {currentAnswer && saving !== soal.id && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Jawaban tersimpan
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/ujian")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Kembali
        </button>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Progress
          </p>

          <p className="font-semibold text-gray-800">
            {Object.keys(jawaban).length} / {ulangan.soal.length} terjawab
          </p>
        </div>
      </div>
    </div>
  );
}