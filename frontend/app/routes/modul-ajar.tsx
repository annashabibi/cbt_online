import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Pencil,
  Plus,
  Printer,
  Trash2,
  Eye,
  Search,
  X,
  BookOpen,
  GraduationCap,
  Layers,
  AlertTriangle,
  FileX2,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config/api";

interface ModulAjar {
  id: number;
  namaPenyusun: string;
  programKeahlian?: string;
  judulElemen?: string;
  kelas: {
    id: number;
    nama: string;
  };
  mataPelajaran: {
    id: number;
    kode: string;
    nama: string;
  };
  semester: {
    id: number;
    tahunAjaran: string;
    semester: string;
  };
}

// Palet warna avatar — dipilih dari nama penyusun supaya konsisten
// (nama yang sama selalu dapat warna yang sama).
const AVATAR_COLORS = [
  "bg-yellow-100 text-yellow-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const sum = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function SemesterBadge({ semester }: { semester?: string }) {
  const label = semester || "-";
  const isGanjil = label.toLowerCase() === "ganjil";
  const isGenap = label.toLowerCase() === "genap";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isGanjil
          ? "bg-blue-50 text-blue-700"
          : isGenap
            ? "bg-purple-50 text-purple-700"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ModulAjarPage() {
  const [data, setData] = useState<ModulAjar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ModulAjar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/modul-ajar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data Modul Ajar");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data Modul Ajar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kelasOptions = useMemo(() => {
    const set = new Map<string, string>();
    data.forEach((item) => {
      if (item.kelas) set.set(item.kelas.nama, item.kelas.nama);
    });
    return Array.from(set.values());
  }, [data]);

  const semesterOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.semester?.semester) set.add(item.semester.semester);
    });
    return Array.from(set.values());
  }, [data]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchesQuery =
        !query ||
        item.namaPenyusun?.toLowerCase().includes(query) ||
        item.mataPelajaran?.nama?.toLowerCase().includes(query) ||
        item.mataPelajaran?.kode?.toLowerCase().includes(query) ||
        item.kelas?.nama?.toLowerCase().includes(query) ||
        item.judulElemen?.toLowerCase().includes(query);

      const matchesKelas = !kelasFilter || item.kelas?.nama === kelasFilter;
      const matchesSemester =
        !semesterFilter || item.semester?.semester === semesterFilter;

      return matchesQuery && matchesKelas && matchesSemester;
    });
  }, [data, search, kelasFilter, semesterFilter]);

  const stats = useMemo(() => {
    const totalMapel = new Set(
      data.map((item) => item.mataPelajaran?.nama).filter(Boolean),
    ).size;
    const totalKelas = new Set(
      data.map((item) => item.kelas?.nama).filter(Boolean),
    ).size;

    return {
      total: data.length,
      totalMapel,
      totalKelas,
    };
  }, [data]);

  const hasActiveFilter = Boolean(search || kelasFilter || semesterFilter);

  const resetFilters = () => {
    setSearch("");
    setKelasFilter("");
    setSemesterFilter("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/modul-ajar/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus Modul Ajar");
      }

      toast.success("Modul Ajar berhasil dihapus");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus Modul Ajar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Modul Ajar</h1>
            {!loading && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                {data.length} total
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Kelola Modul Ajar / RPP pembelajaran
          </p>
        </div>

        <Link
          to="/modul-ajar/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-md active:translate-y-0"
        >
          <Plus size={18} />
          Tambah Modul Ajar
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ClipboardList size={20} />}
          label="Total Modul Ajar"
          value={loading ? "-" : stats.total}
          accent="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Mata Pelajaran Tercakup"
          value={loading ? "-" : stats.totalMapel}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          label="Kelas Tercakup"
          value={loading ? "-" : stats.totalKelas}
          accent="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama penyusun, mata pelajaran, kelas..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-yellow-400 focus:bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasOptions.map((kelas) => (
              <option key={kelas} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-yellow-400 focus:bg-white"
          >
            <option value="">Semua Semester</option>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  No
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Nama Penyusun
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Mata Pelajaran
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Kelas
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Program Keahlian
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Tahun / Semester
                </th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <FileX2 size={22} />
                      </div>
                      <p className="font-medium text-gray-600">
                        {hasActiveFilter
                          ? "Tidak ada Modul Ajar yang cocok"
                          : "Belum ada Modul Ajar"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {hasActiveFilter
                          ? "Coba ubah kata kunci atau filter pencarian."
                          : "Mulai dengan menambahkan Modul Ajar pertama Anda."}
                      </p>

                      {hasActiveFilter ? (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <X size={14} />
                          Reset Filter
                        </button>
                      ) : (
                        <Link
                          to="/modul-ajar/tambah"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500"
                        >
                          <Plus size={16} />
                          Tambah Modul Ajar
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition last:border-0 hover:bg-yellow-50/40"
                  >
                    <td className="px-4 py-4 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                            item.namaPenyusun || "-",
                          )}`}
                        >
                          {getInitials(item.namaPenyusun || "-")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.namaPenyusun}
                          </p>
                          {item.judulElemen && (
                            <p className="text-xs text-gray-400">
                              {item.judulElemen}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      <div className="font-medium">
                        {item.mataPelajaran?.nama || "-"}
                      </div>
                      {item.mataPelajaran?.kode && (
                        <span className="mt-0.5 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          {item.mataPelajaran.kode}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers size={14} className="text-gray-400" />
                        {item.kelas?.nama || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {item.programKeahlian || "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">
                          {item.semester?.tahunAjaran || "-"}
                        </span>
                        <SemesterBadge semester={item.semester?.semester} />
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/modul-ajar/${item.id}`}
                          title="Lihat"
                          className="rounded-lg p-2 text-blue-600 transition hover:scale-105 hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          to={`/modul-ajar/${item.id}/edit`}
                          title="Edit"
                          className="rounded-lg p-2 text-yellow-600 transition hover:scale-105 hover:bg-yellow-50"
                        >
                          <Pencil size={18} />
                        </Link>

                        <Link
                          to={`/modul-ajar/${item.id}/print`}
                          title="Print"
                          className="rounded-lg p-2 text-green-600 transition hover:scale-105 hover:bg-green-50"
                        >
                          <Printer size={18} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus"
                          className="rounded-lg p-2 text-red-600 transition hover:scale-105 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            Menampilkan {filteredData.length} dari {data.length} Modul Ajar
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Hapus Modul Ajar ini?
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
              <p className="font-medium text-gray-800">
                {deleteTarget.namaPenyusun}
              </p>
              <p className="text-gray-500">
                {deleteTarget.mataPelajaran?.nama} &middot;{" "}
                {deleteTarget.kelas?.nama}
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
