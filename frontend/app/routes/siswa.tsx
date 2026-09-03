import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { API_URL } from "../config/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

type Kelas = {
  id: number;
  kode: string;
  nama: string;
};

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  jk: string;
  kelasId: number;
  kelas?: Kelas;
  createdAt?: string;
  updatedAt?: string;
};

type KelasOption = {
  value: number;
  label: string;
};

export default function SiswaPage() {
  const [data, setData] = useState<Siswa[]>([]);
  const [kelasData, setKelasData] = useState<Kelas[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [jk, setJk] = useState("");
  const [kelasId, setKelasId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD DATA
  // =========================

const loadData = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("accessToken");

    const [siswaResponse, kelasResponse] = await Promise.all([
      fetch(`${API_URL}/siswa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/kelas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    if (!siswaResponse.ok) {
      throw new Error("Gagal mengambil data siswa");
    }

    if (!kelasResponse.ok) {
      throw new Error("Gagal mengambil data kelas");
    }

    const siswaResult: Siswa[] = await siswaResponse.json();
    const kelasResult: Kelas[] = await kelasResponse.json();

    setData(siswaResult);
    setKelasData(kelasResult);
  } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil data",
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // KELAS OPTIONS
  // =========================

  const kelasOptions: KelasOption[] = useMemo(() => {
    return kelasData.map((kelas) => ({
      value: kelas.id,
      label: `${kelas.kode} - ${kelas.nama}`,
    }));
  }, [kelasData]);

  // =========================
  // SEARCH
  // =========================

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return data;
    }

    return data.filter((siswa) => {
      const kelasNama = siswa.kelas
        ? `${siswa.kelas.kode} ${siswa.kelas.nama}`
        : "";

      return (
        siswa.nis.toLowerCase().includes(keyword) ||
        siswa.nama.toLowerCase().includes(keyword) ||
        siswa.jk.toLowerCase().includes(keyword) ||
        kelasNama.toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  // =========================
  // MODAL
  // =========================

  const resetForm = () => {
    setNis("");
    setNama("");
    setJk("");
    setKelasId("");
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (siswa: Siswa) => {
    setEditingId(siswa.id);
    setNis(siswa.nis);
    setNama(siswa.nama);
    setJk(siswa.jk);
    setKelasId(String(siswa.kelasId));

    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // =========================
  // ERROR RESPONSE
  // =========================

  const getErrorMessage = async (response: Response) => {
    const result = await response.json().catch(() => null);

    if (Array.isArray(result?.message)) {
      return result.message.join(", ");
    }

    return result?.message || "Terjadi kesalahan";
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nis.trim()) {
      toast.error("NIS wajib diisi");
      return;
    }

    if (!nama.trim()) {
      toast.error("Nama siswa wajib diisi");
      return;
    }

    if (!jk) {
      toast.error("Jenis kelamin wajib dipilih");
      return;
    }

    if (!kelasId) {
      toast.error("Kelas wajib dipilih");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nis: nis.trim(),
        nama: nama.trim(),
        jk,
        kelasId: Number(kelasId),
      };

      const url = editingId
        ? `${API_URL}/siswa/${editingId}`
        : `${API_URL}/siswa`;

      const method = editingId ? "PATCH" : "POST";

const response = await fetch(url, {
  method,
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
});

      if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(message);
      }

      toast.success(
        editingId
          ? "Data siswa berhasil diperbarui"
          : "Data siswa berhasil ditambahkan",
      );

      setShowModal(false);
      resetForm();

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data siswa",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (siswa: Siswa) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus siswa "${siswa.nama}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
const response = await fetch(
  `${API_URL}/siswa/${siswa.id}`,
  {
    method: "DELETE",
    headers: getAuthHeaders(),
  },
);

      if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(message);
      }

      toast.success("Data siswa berhasil dihapus");

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus siswa",
      );
    }
  };

  // =========================
  // HELPERS
  // =========================

  const getKelasName = (siswa: Siswa) => {
    if (siswa.kelas) {
      return `${siswa.kelas.kode} - ${siswa.kelas.nama}`;
    }

    const kelas = kelasData.find(
      (item) => item.id === siswa.kelasId,
    );

    return kelas
      ? `${kelas.kode} - ${kelas.nama}`
      : "-";
  };

  const selectedKelas =
    kelasOptions.find(
      (option) => option.value === Number(kelasId),
    ) ?? null;

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Siswa
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola data siswa yang terdaftar dalam sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-yellow-500"
        >
          + Tambah Siswa
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Siswa
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {data.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Kelas
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {kelasData.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Hasil Pencarian
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {filteredData.length}
          </p>
        </div>

      </div>

      {/* TABLE CARD */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* SEARCH */}
        <div className="border-b border-gray-100 p-5">

          <div className="relative max-w-md">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIS, nama, jenis kelamin, atau kelas..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-gray-50">
              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  No
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  NIS
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Nama Siswa
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Jenis Kelamin
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Kelas
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    Memuat data siswa...
                  </td>
                </tr>

              ) : filteredData.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    {search
                      ? "Data siswa tidak ditemukan."
                      : "Belum ada data siswa."}
                  </td>
                </tr>

              ) : (

                filteredData.map((siswa, index) => (

                  <tr
                    key={siswa.id}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {siswa.nis}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {siswa.nama}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {siswa.jk === "L"
                        ? "Laki-laki"
                        : siswa.jk === "P"
                          ? "Perempuan"
                          : siswa.jk}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getKelasName(siswa)}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() => handleEdit(siswa)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(siswa)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Hapus
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

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingId
                    ? "Edit Siswa"
                    : "Tambah Siswa"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Lengkapi informasi siswa di bawah.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* NIS */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  NIS
                </label>

                <input
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Masukkan NIS"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              {/* NAMA */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Siswa
                </label>

                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama siswa"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              {/* JK */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>

                <select
                  value={jk}
                  onChange={(e) => setJk(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                >

                  <option value="">
                    Pilih jenis kelamin
                  </option>

                  <option value="L">
                    Laki-laki
                  </option>

                  <option value="P">
                    Perempuan
                  </option>

                </select>

              </div>

              {/* KELAS SEARCHABLE */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kelas
                </label>

                {kelasData.length === 0 ? (

                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                    Belum ada kelas. Tambahkan data kelas terlebih dahulu.
                  </div>

                ) : (

                  <Select
                    options={kelasOptions}
                    value={selectedKelas}
                    onChange={(option) => {
                      setKelasId(
                        option
                          ? String(option.value)
                          : "",
                      );
                    }}
                    isSearchable
                    isClearable
                    placeholder="Cari dan pilih kelas..."
                    noOptionsMessage={() =>
                      "Kelas tidak ditemukan"
                    }
                    className="text-sm"
                  />

                )}

              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving || kelasData.length === 0}
                  className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}