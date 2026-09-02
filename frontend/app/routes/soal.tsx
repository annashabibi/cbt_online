import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  Plus,
  Search,
  Trash2,
  RotateCcw,
  Check,
  X,
  Loader2,
  ClipboardList,
  CircleHelp,
  AlertTriangle,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type Ulangan = {
  id: number;
  kode: string;
  judul: string;
};

type Soal = {
  id: number;
  ulanganId: number;
  tipe: "PG" | "ESSAY";
  pertanyaan: string;
  gambar: string | null;
  bobot: number;
  opsiA: string | null;
  opsiB: string | null;
  opsiC: string | null;
  opsiD: string | null;
  jawabanBenar: string | null;
};

type DraftSoal = {
  localId: string;
  id?: number;
  tipe: "PG" | "ESSAY";
  pertanyaan: string;
  bobot: number;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  isNew?: boolean;
  isDeleted?: boolean;
  dirty?: boolean;
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const createEmptySoal = (): DraftSoal => ({
  localId: crypto.randomUUID(),
  tipe: "PG",
  pertanyaan: "",
  bobot: 1,
  opsiA: "",
  opsiB: "",
  opsiC: "",
  opsiD: "",
  jawabanBenar: "",
  isNew: true,
});

const OPSI_FIELDS = [
  ["A", "opsiA"],
  ["B", "opsiB"],
  ["C", "opsiC"],
  ["D", "opsiD"],
] as const;

export default function Soal() {
  const [ulanganData, setUlanganData] = useState<Ulangan[]>([]);
  const [selectedUlangan, setSelectedUlangan] = useState("");

  const [soalList, setSoalList] = useState<DraftSoal[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const loadUlangan = async () => {
    try {
      const response = await fetch(`${API_URL}/ulangan`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data ulangan");
      }

      const result: Ulangan[] = await response.json();

      setUlanganData(result);

      if (result.length > 0) {
        setSelectedUlangan(String(result[0].id));
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Gagal mengambil data ulangan",
      );
    }
  };

  const loadSoal = async (ulanganId: string) => {
    if (!ulanganId) {
      setSoalList([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/soal/ulangan/${ulanganId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data soal");
      }

      const result: Soal[] = await response.json();

      const drafts: DraftSoal[] = result.map((item) => ({
        localId: `db-${item.id}`,
        id: item.id,
        tipe: item.tipe,
        pertanyaan: item.pertanyaan,
        bobot: item.bobot,
        opsiA: item.opsiA ?? "",
        opsiB: item.opsiB ?? "",
        opsiC: item.opsiC ?? "",
        opsiD: item.opsiD ?? "",
        jawabanBenar: item.jawabanBenar ?? "",
      }));

      setSoalList(drafts);
      setExpandedIds(new Set());
      setShowTrash(false);
    } catch (error) {
      console.error(error);

      toast.error(error instanceof Error ? error.message : "Gagal mengambil soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUlangan();
  }, []);

  useEffect(() => {
    loadSoal(selectedUlangan);
  }, [selectedUlangan]);

  const toggleExpand = (localId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (next.has(localId)) {
        next.delete(localId);
      } else {
        next.add(localId);
      }

      return next;
    });
  };

  const updateSoal = (
    localId: string,
    field: keyof DraftSoal,
    value: string | number,
  ) => {
    setSoalList((prev) =>
      prev.map((soal) =>
        soal.localId === localId
          ? {
              ...soal,
              [field]: value,
              dirty: soal.id !== undefined ? true : soal.dirty,
            }
          : soal,
      ),
    );
  };

  const changeTipe = (localId: string, tipe: "PG" | "ESSAY") => {
    setSoalList((prev) =>
      prev.map((soal) => {
        if (soal.localId !== localId) {
          return soal;
        }

        const dirty = soal.id !== undefined ? true : soal.dirty;

        if (tipe === "ESSAY") {
          return {
            ...soal,
            tipe,
            opsiA: "",
            opsiB: "",
            opsiC: "",
            opsiD: "",
            jawabanBenar: "",
            dirty,
          };
        }

        return { ...soal, tipe, dirty };
      }),
    );
  };

  const addSoal = () => {
    const fresh = createEmptySoal();

    setSoalList((prev) => [...prev, fresh]);
    setExpandedIds((prev) => new Set(prev).add(fresh.localId));

    // give the DOM a beat to render, then scroll the new card into view
    setTimeout(() => {
      document
        .getElementById(`soal-${fresh.localId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const requestDelete = (localId: string) => {
    const soal = soalList.find((item) => item.localId === localId);

    if (!soal) return;

    if (soal.isNew) {
      setSoalList((prev) => prev.filter((item) => item.localId !== localId));
      return;
    }

    if (confirmDeleteId !== localId) {
      setConfirmDeleteId(localId);
      return;
    }

    setSoalList((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, isDeleted: true } : item,
      ),
    );
    setConfirmDeleteId(null);
  };

  const restoreSoal = (localId: string) => {
    setSoalList((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, isDeleted: false } : item,
      ),
    );
  };

  const validateSoal = (soal: DraftSoal) => {
    if (!soal.pertanyaan.trim()) {
      return "Pertanyaan wajib diisi";
    }

    if (soal.bobot < 1) {
      return "Bobot harus lebih dari 0";
    }

    if (soal.tipe === "PG") {
      if (!soal.opsiA.trim() || !soal.opsiB.trim() || !soal.opsiC.trim() || !soal.opsiD.trim()) {
        return "Opsi A, B, C, dan D wajib diisi";
      }

      if (!soal.jawabanBenar) {
        return "Jawaban benar wajib dipilih";
      }
    }

    return null;
  };

  const handleUpdate = async () => {
    if (!selectedUlangan) {
      toast.error("Pilih ulangan terlebih dahulu");
      return;
    }

    const activeSoal = soalList.filter((soal) => !soal.isDeleted);

    for (const soal of activeSoal) {
      const error = validateSoal(soal);

      if (error) {
        toast.error(`Soal ${soalList.indexOf(soal) + 1}: ${error}`);
        setExpandedIds((prev) => new Set(prev).add(soal.localId));
        return;
      }
    }

    try {
      setSaving(true);

      const deletedSoal = soalList.filter(
        (soal) => soal.isDeleted && soal.id !== undefined,
      );

      for (const soal of deletedSoal) {
        const response = await fetch(`${API_URL}/soal/${soal.id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Gagal menghapus soal");
        }
      }

      const existingSoal = activeSoal.filter((soal) => soal.id !== undefined);

      for (const soal of existingSoal) {
        const payload = {
          ulanganId: Number(selectedUlangan),
          tipe: soal.tipe,
          pertanyaan: soal.pertanyaan.trim(),
          bobot: Number(soal.bobot),
          ...(soal.tipe === "PG"
            ? {
                opsiA: soal.opsiA.trim(),
                opsiB: soal.opsiB.trim(),
                opsiC: soal.opsiC.trim(),
                opsiD: soal.opsiD.trim(),
                jawabanBenar: soal.jawabanBenar,
              }
            : {}),
        };

        const response = await fetch(`${API_URL}/soal/${soal.id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(
            Array.isArray(result.message) ? result.message.join(", ") : result.message || "Gagal update soal",
          );
        }
      }

      const newSoal = activeSoal.filter((soal) => soal.isNew);

      for (const soal of newSoal) {
        const payload = {
          ulanganId: Number(selectedUlangan),
          tipe: soal.tipe,
          pertanyaan: soal.pertanyaan.trim(),
          bobot: Number(soal.bobot),
          ...(soal.tipe === "PG"
            ? {
                opsiA: soal.opsiA.trim(),
                opsiB: soal.opsiB.trim(),
                opsiC: soal.opsiC.trim(),
                opsiD: soal.opsiD.trim(),
                jawabanBenar: soal.jawabanBenar,
              }
            : {}),
        };

        const response = await fetch(`${API_URL}/soal`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(
            Array.isArray(result.message) ? result.message.join(", ") : result.message || "Gagal menambah soal",
          );
        }
      }

      toast.success("Semua perubahan soal berhasil disimpan");

      await loadSoal(selectedUlangan);
    } catch (error) {
      console.error(error);

      toast.error(error instanceof Error ? error.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const activeSoalList = soalList.filter((soal) => !soal.isDeleted);
  const trashedSoalList = soalList.filter((soal) => soal.isDeleted);

  const visibleSoal = activeSoalList.filter((soal) =>
    soal.pertanyaan.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = useMemo(() => {
    const pg = activeSoalList.filter((s) => s.tipe === "PG").length;
    const essay = activeSoalList.filter((s) => s.tipe === "ESSAY").length;
    const bobot = activeSoalList.reduce((sum, s) => sum + (Number(s.bobot) || 0), 0);
    const pending = soalList.filter(
      (s) => s.isNew || s.dirty || (s.isDeleted && s.id !== undefined),
    ).length;

    return { pg, essay, bobot, pending, total: activeSoalList.length };
  }, [activeSoalList, soalList]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="mx-auto w-full max-w-[1400px] space-y-7 px-6 pt-8 sm:px-10 lg:px-14">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <ClipboardList size={26} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bank Soal</h1>
            <p className="text-base text-slate-500">Buat dan kelola soal pilihan ganda dan essay.</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Ulangan</label>
              <select
                value={selectedUlangan}
                onChange={(e) => {
                  setSelectedUlangan(e.target.value);
                  setSearch("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">-- Pilih Ulangan --</option>
                {ulanganData.map((ulangan) => (
                  <option key={ulangan.id} value={ulangan.id}>
                    {ulangan.kode} - {ulangan.judul}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Cari Soal</label>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pertanyaan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* STATS STRIP */}
          {selectedUlangan && !loading && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
              <StatPill label="Total soal" value={stats.total} accent="bg-slate-900" />
              <StatPill label="Pilihan ganda" value={stats.pg} accent="bg-sky-600" />
              <StatPill label="Essay" value={stats.essay} accent="bg-amber-600" />
              <StatPill label="Total bobot" value={stats.bobot} accent="bg-indigo-600" />
            </div>
          )}
        </div>

        {/* ACTION BAR */}
        {selectedUlangan && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {trashedSoalList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTrash((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 size={14} />
                  {trashedSoalList.length} dihapus
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showTrash ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addSoal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 active:scale-[0.98]"
              >
                <Plus size={16} />
                Tambah Soal
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? "Menyimpan..." : "Update Semua"}
              </button>
            </div>
          </div>
        )}

        {/* TRASH PANEL */}
        {selectedUlangan && trashedSoalList.length > 0 && (
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              showTrash ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="space-y-2 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                {trashedSoalList.map((soal) => (
                  <div
                    key={soal.localId}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5 text-sm shadow-sm"
                  >
                    <span className="truncate text-slate-500 line-through">
                      {soal.pertanyaan || "(tanpa pertanyaan)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => restoreSoal(soal.localId)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <RotateCcw size={13} />
                      Pulihkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOAL LIST */}
        {!selectedUlangan ? (
          <EmptyState message="Pilih ulangan terlebih dahulu." />
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-sm">Memuat soal...</span>
          </div>
        ) : activeSoalList.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <CircleHelp className="text-slate-300" size={32} />
            <p className="text-slate-500">Belum ada soal untuk ulangan ini.</p>
            <button
              type="button"
              onClick={addSoal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Buat Soal Pertama
            </button>
          </div>
        ) : visibleSoal.length === 0 ? (
          <EmptyState message={`Tidak ada soal yang cocok dengan "${search}".`} />
        ) : (
          <div className="space-y-3">
            {visibleSoal.map((soal) => {
              const realIndex = soalList.findIndex((item) => item.localId === soal.localId);
              const isExpanded = expandedIds.has(soal.localId);
              const isConfirmingDelete = confirmDeleteId === soal.localId;

              return (
                <div
                  key={soal.localId}
                  id={`soal-${soal.localId}`}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
                    isExpanded ? "border-indigo-200" : "border-slate-200"
                  }`}
                >
                  {/* CARD HEADER (always visible, click to collapse/expand) */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(soal.localId)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 sm:gap-4 sm:px-5"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                        soal.tipe === "PG" ? "bg-sky-600" : "bg-amber-600"
                      }`}
                    >
                      {realIndex + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            soal.tipe === "PG" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {soal.tipe === "PG" ? "Pilihan Ganda" : "Essay"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                          Bobot {soal.bobot || 0}
                        </span>
                        {soal.isNew && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                            Baru
                          </span>
                        )}
                        {soal.dirty && !soal.isNew && (
                          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
                            
                          </span>
                        )}
                      </div>

                      {!isExpanded && (
                        <p className="truncate text-sm text-slate-500">
                          {soal.pertanyaan || "Belum ada pertanyaan..."}
                        </p>
                      )}
                    </div>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* COLLAPSIBLE BODY */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-5 border-t border-slate-100 px-4 py-5 sm:px-5">
                        {/* TIPE + BOBOT */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipe Soal</label>
                            <div className="inline-flex w-full rounded-lg border border-slate-300 bg-slate-50 p-1">
                              {(["PG", "ESSAY"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => changeTipe(soal.localId, t)}
                                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                                    soal.tipe === t
                                      ? t === "PG"
                                        ? "bg-sky-600 text-white shadow-sm"
                                        : "bg-amber-600 text-white shadow-sm"
                                      : "text-slate-500 hover:text-slate-700"
                                  }`}
                                >
                                  {t === "PG" ? "Pilihan Ganda" : "Essay"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Bobot</label>
                            <input
                              type="number"
                              min="1"
                              value={soal.bobot}
                              onChange={(e) => updateSoal(soal.localId, "bobot", Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        </div>

                        {/* PERTANYAAN */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Pertanyaan</label>
                          <textarea
                            value={soal.pertanyaan}
                            onChange={(e) => updateSoal(soal.localId, "pertanyaan", e.target.value)}
                            rows={4}
                            placeholder="Tulis pertanyaan..."
                            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        {/* PILIHAN GANDA — opsi + jawaban benar digabung */}
                        {soal.tipe === "PG" && (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <label className="block text-sm font-medium text-slate-700">Pilihan Jawaban</label>
                              <span className="text-xs text-slate-400">Klik lingkaran untuk tandai jawaban benar</span>
                            </div>

                            <div className="space-y-2.5">
                              {OPSI_FIELDS.map(([label, field]) => {
                                const isCorrect = soal.jawabanBenar === label;

                                return (
                                  <div
                                    key={field}
                                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                                      isCorrect
                                        ? "border-emerald-300 bg-emerald-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => updateSoal(soal.localId, "jawabanBenar", label)}
                                      title="Tandai sebagai jawaban benar"
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                                        isCorrect
                                          ? "border-emerald-500 bg-emerald-500 text-white"
                                          : "border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500"
                                      }`}
                                    >
                                      {isCorrect ? <Check size={14} /> : label}
                                    </button>

                                    <input
                                      type="text"
                                      value={soal[field]}
                                      onChange={(e) => updateSoal(soal.localId, field, e.target.value)}
                                      placeholder={`Opsi ${label}`}
                                      className="w-full flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            {!soal.jawabanBenar && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                                <AlertTriangle size={13} />
                                Belum ada jawaban benar yang ditandai.
                              </p>
                            )}
                          </div>
                        )}

                        {/* ESSAY */}
                        {soal.tipe === "ESSAY" && (
                          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            Soal essay tidak memiliki pilihan jawaban. Jawaban siswa akan dinilai secara manual pada tahap penilaian.
                          </div>
                        )}

                        {/* CARD FOOTER ACTIONS */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5">
                              <span className="text-xs font-medium text-rose-700">Hapus soal ini?</span>
                              <button
                                type="button"
                                onClick={() => requestDelete(soal.localId)}
                                className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                              >
                                Ya, hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestDelete(soal.localId)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 size={13} />
                              Hapus soal
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STICKY SAVE BAR */}
      {selectedUlangan && activeSoalList.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-14">
            <span className="text-sm text-slate-500">
              {stats.pending > 0 ? (
                <>
                  <span className="font-semibold text-indigo-600">{stats.pending}</span> 
                </>
              ) : (
                "Semua perubahan tersimpan"
              )}
            </span>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Menyimpan..." : "Update Semua Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent}`} />
      <div className="min-w-0">
        <div className="text-xl font-bold leading-none text-slate-900">{value}</div>
        <div className="mt-1 truncate text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
      {message}
    </div>
  );
}
