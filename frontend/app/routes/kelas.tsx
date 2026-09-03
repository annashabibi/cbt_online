import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { API_URL as BASE_API_URL } from "../config/api";

type Kelas = {
  id: number;
  kode: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL = `${BASE_API_URL}/kelas`;

export default function Kelas() {
  const [data, setData] = useState<Kelas[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");

  // =========================
  // GET DATA
  // =========================

  const fetchKelas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil data kelas.");
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter(
      (item) =>
        item.kode.toLowerCase().includes(keyword) ||
        item.nama.toLowerCase().includes(keyword),
    );
  }, [data, search]);

  // =========================
  // MODAL
  // =========================

  const openAddModal = () => {
    setEditingId(null);
    setKode("");
    setNama("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Kelas) => {
    setEditingId(item.id);
    setKode(item.kode);
    setNama(item.nama);
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setKode("");
    setNama("");
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const cleanKode = kode.trim();
    const cleanNama = nama.trim();

    if (!cleanKode || !cleanNama) {
      setError("Kode dan nama kelas wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url =
        editingId !== null
          ? `${API_URL}/${editingId}`
          : API_URL;

      const method =
        editingId !== null ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kode: cleanKode,
          nama: cleanNama,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan data.",
        );
      }

    closeModal();

    await fetchKelas();

    if (editingId !== null) {
      toast.success("Data kelas berhasil diubah");
    } else {
      toast.success("Data kelas berhasil ditambahkan");
    }

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
const handleDelete = async (id: number) => {
  const item = data.find((kelas) => kelas.id === id);

  if (!item) return;

  const confirmed = window.confirm(
    `Apakah kamu yakin ingin menghapus kelas "${item.nama}"?`,
  );

  if (!confirmed) return;

  try {
    setError("");

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Gagal menghapus kelas.",
      );
    }

    await fetchKelas();

    toast.success("Data kelas berhasil dihapus");
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan.",
    );
  }
};

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Master Kelas
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola data kelas siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <span className="text-lg leading-none">
            +
          </span>

          Tambah Kelas
        </button>

      </div>

      {/* ERROR */}

      {error && !isModalOpen && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-sm">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari kode atau nama kelas..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <div className="text-sm text-gray-500">
            Total:{" "}
            <span className="font-semibold text-gray-800">
              {filteredData.length}
            </span>{" "}
            kelas
          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[650px] text-left">

            <thead className="bg-gray-50">

              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">

                <th className="w-20 px-6 py-4">
                  No
                </th>

                <th className="px-6 py-4">
                  Kode
                </th>

                <th className="px-6 py-4">
                  Nama Kelas
                </th>

                <th className="w-48 px-6 py-4 text-center">
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>

              ) : filteredData.length > 0 ? (

                filteredData.map((item, index) => (

                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        {item.kode}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {item.nama}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          Hapus
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center"
                  >

                    <div className="text-3xl">
                      📚
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      Belum ada data kelas
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Klik "Tambah Kelas" untuk
                      membuat data pertama.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="font-semibold text-gray-900">
                  {editingId !== null
                    ? "Edit Kelas"
                    : "Tambah Kelas"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Isi informasi kelas.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="space-y-5 px-6 py-6">

                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kode Kelas
                  </label>

                  <input
                    type="text"
                    value={kode}
                    onChange={(e) =>
                      setKode(e.target.value)
                    }
                    placeholder="Contoh: XII-A"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Kelas
                  </label>

                  <input
                    type="text"
                    value={nama}
                    onChange={(e) =>
                      setNama(e.target.value)
                    }
                    placeholder="Contoh: XII IPA A"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId !== null
                      ? "Simpan Perubahan"
                      : "Simpan Kelas"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}