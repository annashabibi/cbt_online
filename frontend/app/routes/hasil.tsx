import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Loader2,
  RotateCcw,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config/api";

type HasilItem = {
  id: number;
  nilaiPG: number;
  nilaiEssay: number;
  nilaiAkhir: number;
  status: string;
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
    jawaban?: JawabanItem[];
  };
};

type JawabanItem = {
  id: number;
  jawaban: string | null;
  nilai: number;
  dinilai: boolean;
  soal: {
    id: number;
    tipe: string;
    pertanyaan: string;
    bobot: number;
    jawabanBenar: string | null;
  };
};

export default function Hasil() {
  const [data, setData] = useState<HasilItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("ALL");
  const [ulanganFilter, setUlanganFilter] = useState("ALL");

  const [selected, setSelected] = useState<HasilItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

const loadData = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("accessToken");

    const user = JSON.parse(
      localStorage.getItem("user") || "null",
    );

    const role = user?.role?.toUpperCase();

    const endpoint =
      role === "ADMIN"
        ? `${API_URL}/hasil`
        : `${API_URL}/hasil/saya`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data hasil");
    }

    const result = await response.json();

    setData(result);
  } catch (error) {
    console.error(error);
    toast.error("Gagal mengambil data hasil");
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
      loadData();
    }, []);

    const kelasOptions = useMemo(() => {
      const map = new Map<number, string>();

      data.forEach((item) => {
        const kelas = item.pesertaUjian.siswa.kelas;

        if (!map.has(kelas.id)) {
          map.set(kelas.id, kelas.nama);
        }
      });

      return Array.from(map.entries()).map(([id, nama]) => ({
        id,
        nama,
      }));
    }, [data]);

    const ulanganOptions = useMemo(() => {
      const map = new Map<number, string>();

      data.forEach((item) => {
        const ulangan = item.pesertaUjian.ulangan;

        if (!map.has(ulangan.id)) {
          map.set(ulangan.id, ulangan.judul);
        }
      });

      return Array.from(map.entries()).map(([id, judul]) => ({
        id,
        judul,
      }));
    }, [data]);

    const filteredData = useMemo(() => {
      const keyword = search.toLowerCase().trim();

      return data.filter((item) => {
        const siswa = item.pesertaUjian.siswa;
        const ulangan = item.pesertaUjian.ulangan;

        const matchesSearch =
          !keyword ||
          siswa.nama.toLowerCase().includes(keyword) ||
          siswa.nis.toLowerCase().includes(keyword);

        const matchesKelas =
          kelasFilter === "ALL" ||
          String(siswa.kelas.id) === kelasFilter;

        const matchesUlangan =
          ulanganFilter === "ALL" ||
          String(ulangan.id) === ulanganFilter;

        return (
          matchesSearch &&
          matchesKelas &&
          matchesUlangan
        );
      });
    }, [data, search, kelasFilter, ulanganFilter]);

    const resetFilter = () => {
      setSearch("");
      setKelasFilter("ALL");
      setUlanganFilter("ALL");
    };

    const openDetail = async (item: HasilItem) => {
      try {
        setDetailLoading(true);

        const token = localStorage.getItem("accessToken");

        const response = await 
        fetch(`${API_URL}/hasil/admin/${item.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        
        if (!response.ok) {
          throw new Error("Gagal mengambil detail hasil");
        }

        const result = await response.json();
        setSelected(result);
      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil detail hasil");
      } finally {
        setDetailLoading(false);
      }
    };

    const getNilaiClass = (nilai: number) => {
      if (nilai >= 80) {
        return "text-green-600";
      }

      if (nilai >= 60) {
        return "text-yellow-600";
      }

      return "text-red-600";
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hasil Ujian
          </h1>

          <p className="mt-2 text-gray-500">
            Lihat dan kelola hasil ulangan siswa.
          </p>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Hasil
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {data.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Nilai Tertinggi
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {data.length > 0
                ? Math.max(
                    ...data.map((item) => item.nilaiAkhir),
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Rata-rata
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {data.length > 0
                ? (
                    data.reduce(
                      (total, item) =>
                        total + item.nilaiAkhir,
                      0,
                    ) / data.length
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / NIS..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Kelas */}
            <select
              value={kelasFilter}
              onChange={(e) =>
                setKelasFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                Semua Kelas
              </option>

              {kelasOptions.map((kelas) => (
                <option
                  key={kelas.id}
                  value={kelas.id}
                >
                  {kelas.nama}
                </option>
              ))}
            </select>

            {/* Ulangan */}
            <select
              value={ulanganFilter}
              onChange={(e) =>
                setUlanganFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                Semua Ulangan
              </option>

              {ulanganOptions.map((ulangan) => (
                <option
                  key={ulangan.id}
                  value={ulangan.id}
                >
                  {ulangan.judul}
                </option>
              ))}
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={resetFilter}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuat hasil...
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-300" />

              <h2 className="mt-4 font-semibold text-gray-900">
                Tidak ada hasil
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Belum ada data yang sesuai dengan filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">
                      No
                    </th>

                    <th className="px-5 py-4">
                      Siswa
                    </th>

                    <th className="px-5 py-4">
                      NIS
                    </th>

                    <th className="px-5 py-4">
                      Kelas
                    </th>

                    <th className="px-5 py-4">
                      Ulangan
                    </th>

                    <th className="px-5 py-4 text-center">
                      Nilai PG
                    </th>

                    <th className="px-5 py-4 text-center">
                      Nilai Essay
                    </th>

                    <th className="px-5 py-4 text-center">
                      Nilai Akhir
                    </th>

                    <th className="px-5 py-4 text-center">
                      Status
                    </th>

                    <th className="px-5 py-4 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item, index) => {
                    const siswa =
                      item.pesertaUjian.siswa;

                    const ulangan =
                      item.pesertaUjian.ulangan;

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 text-gray-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {siswa.nama}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {siswa.nis}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {siswa.kelas.nama}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {ulangan.judul}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {item.nilaiPG.toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {item.nilaiEssay.toFixed(2)}
                        </td>

                        <td
                          className={`px-5 py-4 text-center text-lg font-bold ${getNilaiClass(
                            item.nilaiAkhir,
                          )}`}
                        >
                          {item.nilaiAkhir.toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              openDetail(item)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Detail Hasil Ujian
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selected.pesertaUjian.siswa.nama}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
                {/* Identitas */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Siswa
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selected.pesertaUjian.siswa.nama}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      NIS
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selected.pesertaUjian.siswa.nis}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Kelas
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selected.pesertaUjian.siswa.kelas.nama}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-500">
                      Ulangan
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selected.pesertaUjian.ulangan.judul}
                    </p>
                  </div>
                </div>

                {/* Nilai */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">
                      Nilai PG
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selected.nilaiPG.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">
                      Nilai Essay
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selected.nilaiEssay.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-600">
                      Nilai Akhir
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-700">
                      {selected.nilaiAkhir.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Jawaban */}
                {selected.pesertaUjian.jawaban && (
                  <div className="mt-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      Detail Jawaban
                    </h3>

                    <div className="space-y-4">
                      {selected.pesertaUjian.jawaban.map(
                        (jawaban, index) => (
                          <div
                            key={jawaban.id}
                            className="rounded-xl border border-gray-200 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-semibold text-gray-900">
                                Soal {index + 1}
                              </p>

                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                {jawaban.soal.tipe}
                              </span>
                            </div>

                            <p className="mt-3 text-gray-700">
                              {jawaban.soal.pertanyaan}
                            </p>

                            <div className="mt-4 rounded-lg bg-gray-50 p-4">
                              <p className="text-xs font-semibold uppercase text-gray-500">
                                Jawaban Siswa
                              </p>

                              <p className="mt-1 text-gray-800">
                                {jawaban.jawaban || "-"}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                Bobot: {jawaban.soal.bobot}
                              </span>

                              <span className="font-bold text-gray-900">
                                Nilai: {jawaban.nilai}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
            <div className="rounded-xl bg-white p-5 shadow-lg">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>
    );
  }