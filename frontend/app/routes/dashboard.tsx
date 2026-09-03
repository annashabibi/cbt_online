import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { API_URL } from "../config/api";

type Statistik = {
  totalSiswa: number;
  totalUlangan: number;
  totalSoal: number;
  totalHasil: number;
  ulanganAktif: number;
  totalPeserta: number;
  totalSelesai: number;
  rataRataNilai: number;
  tingkatKelulusan: number;
};

type UlanganTerbaru = {
  id: number;
  kode: string;
  judul: string;
  deskripsi: string | null;
  tanggal: string;
  durasi: number;
  status: boolean;
  kelas: {
    id: number;
    kode: string;
    nama: string;
  } | null;
  jumlahSoal: number;
};

type DashboardAdmin = {
  statistik: Statistik;
  ulanganTerbaru: UlanganTerbaru[];
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const nama =
    user?.siswa?.nama ||
    user?.username ||
    "Administrator";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const role =
        user?.role?.toUpperCase();

      if (role !== "ADMIN") {
        navigate("/ujian", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        `${API_URL}/dashboard/admin`,
        {
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
                "Gagal mengambil data dashboard",
        );
      }

      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Memuat dashboard...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Gagal memuat dashboard
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const statistik = data.statistik;

  // =========================
  // STATISTIK
  // =========================
  const stats = [
    {
      title: "Total Siswa",
      value: statistik.totalSiswa,
      description: "Jumlah siswa terdaftar",
      icon: "👨‍🎓",
    },
    {
      title: "Total Ulangan",
      value: statistik.totalUlangan,
      description: `${statistik.ulanganAktif} ulangan aktif`,
      icon: "📝",
    },
    {
      title: "Total Soal",
      value: statistik.totalSoal,
      description: "Jumlah soal dalam bank soal",
      icon: "📚",
    },
    {
      title: "Hasil Ulangan",
      value: statistik.totalHasil,
      description: "Data penilaian",
      icon: "📊",
    },
  ];

  return (
    <div className="space-y-8">

      {/* =========================
          WELCOME
      ========================= */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Selamat Datang, {nama} 👋
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Berikut ringkasan aktivitas sistem
          ulangan siswa.
        </p>
      </section>

      {/* =========================
          STATISTICS
      ========================= */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h2>

                <p className="mt-2 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl transition group-hover:bg-indigo-100">
                {stat.icon}
              </div>

            </div>
          </div>
        ))}

      </section>

      {/* =========================
          MAIN GRID
      ========================= */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* =========================
            ULANGAN TERBARU
        ========================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>
              <h2 className="font-semibold text-gray-900">
                Ulangan Terbaru
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Daftar ulangan terbaru dalam sistem
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/ulangan")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Lihat Semua →
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-left">

              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">

                <tr>
                  <th className="px-6 py-4">
                    Ulangan
                  </th>

                  <th className="px-4 py-4">
                    Kelas
                  </th>

                  <th className="px-4 py-4">
                    Soal
                  </th>

                  <th className="px-4 py-4">
                    Durasi
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {data.ulanganTerbaru.length === 0 ? (

                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      Belum ada data ulangan.
                    </td>
                  </tr>

                ) : (

                  data.ulanganTerbaru.map(
                    (ulangan) => (
                      <tr
                        key={ulangan.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {ulangan.judul}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {ulangan.kode}
                            </p>
                          </div>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">

                          {ulangan.kelas
                            ? `${ulangan.kelas.kode} - ${ulangan.kelas.nama}`
                            : "-"}

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {ulangan.jumlahSoal}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {ulangan.durasi} Menit
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              ulangan.status
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {ulangan.status
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>

                        </td>

                      </tr>
                    ),
                  )

                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* =========================
            RINGKASAN AKTIVITAS
        ========================= */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <h2 className="font-semibold text-gray-900">
              Ringkasan Aktivitas
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Statistik aktivitas ujian
            </p>

          </div>

          <div className="divide-y divide-gray-100">

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Total Peserta
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Siswa yang mengikuti ujian
                </p>
              </div>

              <span className="text-xl font-bold text-indigo-600">
                {statistik.totalPeserta}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Ujian Selesai
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Peserta telah menyelesaikan ujian
                </p>
              </div>

              <span className="text-xl font-bold text-green-600">
                {statistik.totalSelesai}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Rata-rata Nilai
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Dari seluruh hasil ujian
                </p>
              </div>

              <span className="text-xl font-bold text-blue-600">
                {statistik.rataRataNilai}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Tingkat Kelulusan
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Nilai minimal 75
                </p>
              </div>

              <span className="text-xl font-bold text-purple-600">
                {statistik.tingkatKelulusan}%
              </span>
            </div>

          </div>
        </div>

      </section>

      {/* =========================
          BOTTOM CARDS
      ========================= */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

          <p className="text-sm font-medium text-indigo-600">
            Rata-rata Nilai
          </p>

          <div className="mt-2">
            <span className="text-3xl font-bold text-indigo-900">
              {statistik.rataRataNilai}
            </span>
          </div>

          <p className="mt-2 text-xs text-indigo-500">
            Dari seluruh hasil ulangan
          </p>

        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

          <p className="text-sm font-medium text-green-600">
            Tingkat Kelulusan
          </p>

          <div className="mt-2">
            <span className="text-3xl font-bold text-green-900">
              {statistik.tingkatKelulusan}%
            </span>
          </div>

          <p className="mt-2 text-xs text-green-500">
            Berdasarkan nilai minimal 75
          </p>

        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">

          <p className="text-sm font-medium text-orange-600">
            Ujian Selesai
          </p>

          <div className="mt-2">
            <span className="text-3xl font-bold text-orange-900">
              {statistik.totalSelesai}
            </span>
          </div>

          <p className="mt-2 text-xs text-orange-500">
            Dari {statistik.totalPeserta} peserta
          </p>

        </div>

      </section>

    </div>
  );
}