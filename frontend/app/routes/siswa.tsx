import { useMemo, useState } from "react";

type Kelas = {
  id: number;
  kode: string;
  nama: string;
};

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  kelasId: number;
};

const kelasData: Kelas[] = [
  {
    id: 1,
    kode: "XII-A",
    nama: "XII IPA A",
  },
  {
    id: 2,
    kode: "XII-B",
    nama: "XII IPA B",
  },
  {
    id: 3,
    kode: "XI-RPL",
    nama: "XI RPL",
  },
  {
    id: 4,
    kode: "XII-RPL",
    nama: "XII RPL",
  },
];

const initialData: Siswa[] = [
  {
    id: 1,
    nis: "2026001",
    nama: "Budi Santoso",
    kelasId: 1,
  },
  {
    id: 2,
    nis: "2026002",
    nama: "Andi Pratama",
    kelasId: 1,
  },
  {
    id: 3,
    nis: "2026003",
    nama: "Siti Aminah",
    kelasId: 2,
  },
  {
    id: 4,
    nis: "2026004",
    nama: "Rizky Ramadhan",
    kelasId: 3,
  },
  {
    id: 5,
    nis: "2026005",
    nama: "Dinda Putri",
    kelasId: 4,
  },
];

export default function Siswa() {
  const [data, setData] = useState<Siswa[]>(initialData);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [kelasId, setKelasId] = useState("");

  const [error, setError] = useState("");

  const getKelasName = (kelasId: number) => {
    const kelas = kelasData.find((item) => item.id === kelasId);

    return kelas ? kelas.nama : "-";
  };

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter((item) => {
      const kelasName = getKelasName(item.kelasId).toLowerCase();

      return (
        item.nis.toLowerCase().includes(keyword) ||
        item.nama.toLowerCase().includes(keyword) ||
        kelasName.includes(keyword)
      );
    });
  }, [data, search]);

  const openAddModal = () => {
    setEditingId(null);
    setNis("");
    setNama("");
    setKelasId("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Siswa) => {
    setEditingId(item.id);
    setNis(item.nis);
    setNama(item.nama);
    setKelasId(String(item.kelasId));
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNis("");
    setNama("");
    setKelasId("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanNis = nis.trim();
    const cleanNama = nama.trim();

    if (!cleanNis || !cleanNama || !kelasId) {
      setError("NIS, nama siswa, dan kelas wajib diisi.");
      return;
    }

    const duplicateNis = data.some(
      (item) =>
        item.nis.toLowerCase() === cleanNis.toLowerCase() &&
        item.id !== editingId,
    );

    if (duplicateNis) {
      setError("NIS sudah digunakan.");
      return;
    }

    if (editingId !== null) {
      setData((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                nis: cleanNis,
                nama: cleanNama,
                kelasId: Number(kelasId),
              }
            : item,
        ),
      );
    } else {
      const newSiswa: Siswa = {
        id: Date.now(),
        nis: cleanNis,
        nama: cleanNama,
        kelasId: Number(kelasId),
      };

      setData((current) => [...current, newSiswa]);
    }

    closeModal();
  };

  const handleDelete = (id: number) => {
    const siswa = data.find((item) => item.id === id);

    if (!siswa) return;

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus siswa "${siswa.nama}"?`,
    );

    if (!confirmed) return;

    setData((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Master Siswa
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola data siswa yang mengikuti ulangan.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <span className="text-lg leading-none">+</span>
          Tambah Siswa
        </button>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Siswa
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Kelas
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {kelasData.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Hasil Pencarian
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {filteredData.length}
          </p>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIS, nama, atau kelas..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-800">
              {filteredData.length}
            </span>{" "}
            siswa
          </p>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px] text-left">

            <thead className="bg-gray-50">

              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">

                <th className="w-20 px-6 py-4">
                  No
                </th>

                <th className="px-6 py-4">
                  NIS
                </th>

                <th className="px-6 py-4">
                  Nama Siswa
                </th>

                <th className="px-6 py-4">
                  Kelas
                </th>

                <th className="w-48 px-6 py-4 text-center">
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (

                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">

                      <span className="font-mono text-sm font-medium text-gray-700">
                        {item.nis}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm font-medium text-gray-800">
                          {item.nama}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {getKelasName(item.kelasId)}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
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
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >

                    <div className="text-3xl">
                      🔎
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      Data siswa tidak ditemukan
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Coba gunakan kata kunci pencarian lain.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="font-semibold text-gray-900">
                  {editingId !== null
                    ? "Edit Siswa"
                    : "Tambah Siswa"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Isi informasi siswa dengan benar.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              <div className="space-y-5 px-6 py-6">

                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* NIS */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    NIS
                  </label>

                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 2026001"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                {/* Nama */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Siswa
                  </label>

                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama siswa"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                {/* Kelas */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kelas
                  </label>

                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="">
                      Pilih kelas
                    </option>

                    {kelasData.map((kelas) => (
                      <option
                        key={kelas.id}
                        value={kelas.id}
                      >
                        {kelas.nama}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {editingId !== null
                    ? "Simpan Perubahan"
                    : "Simpan Siswa"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}