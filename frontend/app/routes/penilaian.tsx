import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type EssayItem = {
  id: number;
  jawaban: string | null;
  nilai: number;
  dinilai: boolean;
  soal: {
    id: number;
    pertanyaan: string;
    bobot: number;
    tipe: string;
  };
  pesertaUjian: {
    id: number;
    siswa: {
      id: number;
      nis: string;
      nama: string;
      kelas: {
        id: number;
        kode: string;
        nama: string;
      };
    };
    ulangan: {
      id: number;
      kode: string;
      judul: string;
    };
  };
};

// Deterministic accent color per class, so a class keeps the same
// color everywhere in the list — a quick visual anchor while scanning.
const KELAS_PALETTE = [
  { text: "text-teal-700", bg: "bg-teal-50", ring: "ring-teal-600/20", dot: "bg-teal-600" },
  { text: "text-indigo-700", bg: "bg-indigo-50", ring: "ring-indigo-600/20", dot: "bg-indigo-600" },
  { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-600/20", dot: "bg-rose-600" },
  { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-600/20", dot: "bg-amber-600" },
  { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-600/20", dot: "bg-sky-600" },
];

function kelasColor(kode: string) {
  let hash = 0;
  for (let i = 0; i < kode.length; i++) hash = kode.charCodeAt(i) + ((hash << 5) - hash);
  return KELAS_PALETTE[Math.abs(hash) % KELAS_PALETTE.length];
}

function initials(nama: string) {
  const parts = nama.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Penilaian() {
  const [data, setData] = useState<EssayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [nilaiInput, setNilaiInput] = useState<Record<number, string>>({});
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const loadData = async (opts?: { openFirst?: boolean }) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "http://localhost:3000/penilaian/essay/belum-dinilai",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data penilaian");
      }

      const result: EssayItem[] = await response.json();

      setData(result);

      const initialValues: Record<number, string> = {};
      result.forEach((item) => {
        initialValues[item.id] = String(item.nilai ?? 0);
      });
      setNilaiInput(initialValues);

      // Keep the list approachable: start with everything collapsed,
      // except open the very first item on initial load so the page
      // never feels empty at a glance.
      if (opts?.openFirst && result.length > 0) {
        setOpenIds(new Set([result[0].id]));
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data penilaian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({ openFirst: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNilai = async (item: EssayItem) => {
    const nilai = Number(nilaiInput[item.id]);

    if (Number.isNaN(nilai)) {
      toast.error("Nilai harus berupa angka");
      return;
    }

    if (nilai < 0) {
      toast.error("Nilai tidak boleh kurang dari 0");
      return;
    }

    if (nilai > item.soal.bobot) {
      toast.error(`Nilai maksimal adalah ${item.soal.bobot}`);
      return;
    }

    try {
      setSavingId(item.id);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:3000/penilaian/jawaban/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nilai }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan nilai");
      }

      toast.success("Nilai berhasil disimpan");

      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan nilai",
      );
    } finally {
      setSavingId(null);
    }
  };

  const totalBelumDinilai = data.length;

  // Group by ulangan so a teacher grading several quizzes can see
  // how much of each one is left, without losing the flat list.
  const ulanganSummary = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const key = item.pesertaUjian.ulangan.judul;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Penilaian Essay
          </h1>
          <p className="mt-1.5 text-slate-500">
            Periksa dan beri nilai jawaban Essay siswa satu per satu.
          </p>
        </div>

        {!loading && totalBelumDinilai > 0 && (
          <div className="flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-sm font-medium text-amber-700 sm:self-auto">
            <Clock className="h-4 w-4" />
            {totalBelumDinilai} menunggu penilaian
          </div>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-amber-50 p-3">
              <FileQuestion className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Belum Dinilai</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalBelumDinilai}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-teal-50 p-3">
              <GraduationCap className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ulangan Terlibat</p>
              <p className="text-2xl font-bold text-slate-900">
                {ulanganSummary.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-1">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-slate-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-lg font-bold text-slate-900">
                {totalBelumDinilai === 0 ? "Semua Selesai" : "Sedang Berjalan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan per ulangan */}
      {!loading && ulanganSummary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ulanganSummary.map(([judul, count]) => (
            <span
              key={judul}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
            >
              {judul}
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-500">
                {count}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data penilaian...
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 className="h-7 w-7 text-teal-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Semua Essay Sudah Dinilai
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tidak ada jawaban Essay yang menunggu penilaian saat ini.
          </p>
        </div>
      )}

      {/* List Essay — collapsible */}
      {!loading && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((item, index) => {
            const isOpen = openIds.has(item.id);
            const color = kelasColor(item.pesertaUjian.siswa.kelas.kode);
            const isSaving = savingId === item.id;

            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow"
              >
                {/* Row header — always visible, click to expand */}
                <button
                  type="button"
                  onClick={() => toggleOpen(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`essay-panel-${item.id}`}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${color.bg} ${color.text}`}
                  >
                    {initials(item.pesertaUjian.siswa.nama)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">
                        {item.pesertaUjian.siswa.nama}
                      </p>
                      <span className="hidden text-xs text-slate-400 sm:inline">
                        · {item.pesertaUjian.siswa.nis}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {item.pesertaUjian.ulangan.judul}
                      <span className="text-slate-300"> · </span>
                      Soal #{index + 1}
                    </p>
                  </div>

                  <span
                    className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex ${color.bg} ${color.text} ${color.ring}`}
                  >
                    {item.pesertaUjian.siswa.kelas.nama}
                  </span>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Bobot {item.soal.bobot}
                  </span>

                  <ChevronDown
                    className={`h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Collapsible panel */}
                <div
                  id={`essay-panel-${item.id}`}
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-5">
                      {/* Pertanyaan */}
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-500">
                          Pertanyaan
                        </p>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
                          {item.soal.pertanyaan}
                        </div>
                      </div>

                      {/* Jawaban */}
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-500">
                          Jawaban Siswa
                        </p>
                        <div className="min-h-24 rounded-xl border border-slate-200 p-4 leading-7 text-slate-800">
                          {item.jawaban || (
                            <span className="italic text-slate-400">
                              Siswa tidak memberikan jawaban.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Penilaian */}
                      <div className="flex flex-col gap-4 rounded-xl border border-teal-100 bg-teal-50/60 p-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <label
                            htmlFor={`nilai-${item.id}`}
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Nilai
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`nilai-${item.id}`}
                              type="number"
                              min={0}
                              max={item.soal.bobot}
                              value={nilaiInput[item.id] ?? ""}
                              onChange={(e) =>
                                setNilaiInput((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />
                            <span className="text-sm text-slate-500">
                              / {item.soal.bobot}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNilai(item)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Simpan Nilai
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
