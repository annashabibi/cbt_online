import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Clock, FileText, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3000";

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

export default function Ujian() {
  const navigate = useNavigate();

  const [data, setData] = useState<Ulangan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUjian();
  }, []);

  const loadUjian = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/ulangan/saya`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data ulangan",
        );
      }

      setData(result);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data ulangan",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const mulaiUjian = (ulanganId: number) => {
    navigate(`/ujian/${ulanganId}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ujian Saya
        </h1>

        <p className="mt-1 text-gray-500">
          Daftar ulangan yang tersedia untuk kelas kamu.
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Memuat daftar ujian...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-7 w-7 text-gray-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            Belum ada ujian
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Saat ini belum ada ulangan yang tersedia untuk kelas kamu.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* CARD HEADER */}
              <div className="bg-blue-600 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                      {item.kode}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {item.judul}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-white/20 p-2">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="space-y-4 p-5">
                {/* KELAS */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Kelas
                    </p>

                    <p className="font-medium text-gray-800">
                      {item.kelas.nama}
                    </p>
                  </div>
                </div>

                {/* WAKTU */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Jadwal
                    </p>

                    <p className="font-medium text-gray-800">
                      {formatTanggal(item.tanggal)}
                    </p>
                  </div>
                </div>

                {/* DURASI */}
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Durasi
                    </span>

                    <span className="font-semibold text-gray-800">
                      {item.durasi} menit
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
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

                    <p className="mt-1 text-sm text-gray-600">
                      {item.deskripsi}
                    </p>
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="button"
                  onClick={() => mulaiUjian(item.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <PlayCircle className="h-5 w-5" />
                  Mulai Ujian
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}