import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Printer, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://backend-production-bef12.up.railway.app";

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

export default function ModulAjarPage() {
  const [data, setData] = useState<ModulAjar[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus Modul Ajar ini?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/modul-ajar/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus Modul Ajar");
      }

      toast.success("Modul Ajar berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus Modul Ajar");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Modul Ajar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola Modul Ajar / RPP pembelajaran
          </p>
        </div>

        <Link
          to="/modul-ajar/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500"
        >
          <Plus size={18} />
          Tambah Modul Ajar
        </Link>
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
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Belum ada Modul Ajar.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-gray-600">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-800">
                      {item.namaPenyusun}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      <div className="font-medium">
                        {item.mataPelajaran?.nama || "-"}
                      </div>

                      {item.mataPelajaran?.kode && (
                        <div className="text-xs text-gray-400">
                          {item.mataPelajaran.kode}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {item.kelas?.nama || "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {item.programKeahlian || "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {item.semester
                        ? `${item.semester.tahunAjaran} - ${item.semester.semester}`
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* LIHAT */}
                        <Link
                          to={`/modul-ajar/${item.id}`}
                          title="Lihat"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </Link>

                        {/* EDIT */}
                        <Link
                          to={`/modul-ajar/${item.id}/edit`}
                          title="Edit"
                          className="rounded-lg p-2 text-yellow-600 transition hover:bg-yellow-50"
                        >
                          <Pencil size={18} />
                        </Link>

                        {/* PRINT */}
                        <Link
                          to={`/modul-ajar/${item.id}/print`}
                          title="Print"
                          className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                        >
                          <Printer size={18} />
                        </Link>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
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
      </div>
    </div>
  );
}