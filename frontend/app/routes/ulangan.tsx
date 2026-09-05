import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


import { API_URL } from "../config/api";
type Kelas = {
  id: number;
  kode: string;
  nama: string;
};

type ProgressUlangan = {
  totalSiswa: number;
  mengerjakan: number;
  selesai: number;
  belumMengerjakan: number;
  daftarBelumMengerjakan: {
    id: number;
    nama: string;
    nis: string;
  }[];
};



type Ulangan = {
  id: number;
  kode: string;
  judul: string;
  deskripsi: string | null;
  kelasId: number;
  tanggal: string;
  durasi: number;
  status: boolean;
  kelas: Kelas;
};

type FormData = {
  kode: string;
  judul: string;
  deskripsi: string;
  kelasId: string;
  tanggal: string;
  durasi: string;
  status: boolean;
};

const initialForm: FormData = {
  kode: "",
  judul: "",
  deskripsi: "",
  kelasId: "",
  tanggal: "",
  durasi: "60",
  status: true,
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default function Ulangan() {
  const [data, setData] = useState<Ulangan[]>([]);
  const [kelasData, setKelasData] = useState<Kelas[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [progressData, setProgressData] = useState<
  Record<number, ProgressUlangan>
>({});
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);


  const [showProgressModal, setShowProgressModal] =
  useState(false);

const [selectedUlangan, setSelectedUlangan] =
  useState<Ulangan | null>(null);

const [nomorWhatsapp, setNomorWhatsapp] =
  useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const [ulanganResponse, kelasResponse] = await Promise.all([
        fetch(`${API_URL}/ulangan`, {
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

      if (!ulanganResponse.ok) {
        throw new Error("Gagal mengambil data ulangan");
      }

      if (!kelasResponse.ok) {
        throw new Error("Gagal mengambil data kelas");
      }

      const ulanganResult: Ulangan[] = await ulanganResponse.json();
      const kelasResult: Kelas[] = await kelasResponse.json();

      setData(ulanganResult);
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

useEffect(() => {
  if (data.length === 0) return;

  data.forEach((item) => {
    loadProgress(item.id);
  });
}, [data]);

const loadProgress = async (ulanganId: number) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_URL}/ulangan/${ulanganId}/progress`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil progress ulangan",
      );
    }

    const result: ProgressUlangan =
      await response.json();

    setProgressData((prev) => ({
      ...prev,
      [ulanganId]: result,
    }));
  } catch (error) {
    console.error(
      `Gagal mengambil progress ulangan ${ulanganId}:`,
      error,
    );
  }
};

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter(
      (item) =>
        item.kode.toLowerCase().includes(keyword) ||
        item.judul.toLowerCase().includes(keyword) ||
        item.kelas.nama.toLowerCase().includes(keyword),
    );
  }, [data, search]);

  const openTambah = () => {
    setEditId(null);

    setForm({
      ...initialForm,
      kelasId: kelasData.length > 0 ? String(kelasData[0].id) : "",
    });

    setShowModal(true);
  };

  const openEdit = (item: Ulangan) => {
    setEditId(item.id);

    const date = new Date(item.tanggal);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setForm({
      kode: item.kode,
      judul: item.judul,
      deskripsi: item.deskripsi ?? "",
      kelasId: String(item.kelasId),
      tanggal: localDate,
      durasi: String(item.durasi),
      status: item.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditId(null);
    setForm(initialForm);
  };

  const openProgressModal = (item: Ulangan) => {
  setSelectedUlangan(item);
  setShowProgressModal(true);
};

const closeProgressModal = () => {
  setSelectedUlangan(null);
  setShowProgressModal(false);
};

const kirimWhatsApp = (
  siswaId: number,
  namaSiswa: string,
) => {
  const nomor = nomorWhatsapp[siswaId]?.trim();

  if (!nomor) {
    toast.error(
      `Nomor WhatsApp untuk ${namaSiswa} belum diisi`,
    );
    return;
  }

  let nomorTujuan = nomor.replace(/\D/g, "");

  if (nomorTujuan.startsWith("0")) {
    nomorTujuan =
      "62" + nomorTujuan.substring(1);
  }

  if (!nomorTujuan.startsWith("62")) {
    toast.error(
      "Nomor WhatsApp harus menggunakan nomor Indonesia",
    );
    return;
  }

  const judul =
    selectedUlangan?.judul ||
    "Ulangan";

  const pesan =
    `Halo, kami ingin menginformasikan bahwa ${namaSiswa} belum mengerjakan ${judul}. ` +
    `Mohon untuk segera mengerjakan ulangan melalui sistem CBT. Terima kasih.`;

  const url =
    `https://wa.me/${nomorTujuan}?text=` +
    encodeURIComponent(pesan);

  window.open(url, "_blank");
};

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.kode.trim()) {
      toast.error("Kode ulangan wajib diisi");
      return;
    }

    if (!form.judul.trim()) {
      toast.error("Judul ulangan wajib diisi");
      return;
    }

    if (!form.kelasId) {
      toast.error("Kelas wajib dipilih");
      return;
    }

    if (!form.tanggal) {
      toast.error("Tanggal ulangan wajib diisi");
      return;
    }

    if (!form.durasi || Number(form.durasi) < 1) {
      toast.error("Durasi harus lebih dari 0 menit");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        kode: form.kode.trim(),
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim() || undefined,
        kelasId: Number(form.kelasId),
        tanggal: new Date(form.tanggal).toISOString(),
        durasi: Number(form.durasi),
        status: form.status,
      };

      const url =
        editId === null
          ? `${API_URL}/ulangan`
          : `${API_URL}/ulangan/${editId}`;

      const method = editId === null ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan data ulangan",
        );
      }

      toast.success(
        editId === null
          ? "Ulangan berhasil ditambahkan"
          : "Ulangan berhasil diperbarui",
      );

      closeModal();
      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Ulangan) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus ulangan "${item.judul}"?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/ulangan/${item.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menghapus ulangan",
        );
      }

      toast.success("Ulangan berhasil dihapus");

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data",
      );
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Master Ulangan
          </h1>

          <p className="mt-1 text-gray-500">
            Kelola data ulangan siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={openTambah}
          disabled={kelasData.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          + Tambah Ulangan
        </button>
      </div>

      {/* SEARCH */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Cari kode, judul, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Tanggal</th>
               <th className="px-4 py-3">Durasi</th>
<th className="px-4 py-3 text-center">
  Total Siswa
</th>

<th className="px-4 py-3 text-center">
  Mengerjakan
</th>

<th className="px-4 py-3 text-center">
  Selesai
</th>

<th className="px-4 py-3 text-center">
  Belum Mengerjakan
</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3 text-center">
  Aksi
</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    {search
                      ? "Data tidak ditemukan."
                      : "Belum ada data ulangan."}
                  </td>
                </tr>
              ) : (
               filteredData.map((item, index) => {
  const progress = progressData[item.id];

  return (
    <tr
      key={item.id}
      className="transition hover:bg-gray-50"
    >
                    <td className="px-4 py-3">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.kode}
                    </td>

                    <td className="px-4 py-3">
                      {item.judul}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {item.kelas.nama}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.kelas.kode}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {formatTanggal(item.tanggal)}
                    </td>

                    <td className="px-4 py-3">
                      {item.durasi} menit
                    </td>
                    <td className="px-4 py-3 text-center">
  {progress ? (
    <span className="font-semibold text-gray-800">
      {progress.totalSiswa}
    </span>
  ) : (
    <span className="text-gray-400">
      ...
    </span>
  )}
</td>

<td className="px-4 py-3 text-center">
  {progress ? (
    <span className="font-semibold text-blue-600">
      {progress.mengerjakan}
    </span>
  ) : (
    <span className="text-gray-400">
      ...
    </span>
  )}
</td>

<td className="px-4 py-3 text-center">
  {progress ? (
    <span className="font-semibold text-green-600">
      {progress.selesai}
    </span>
  ) : (
    <span className="text-gray-400">
      ...
    </span>
  )}
</td>

<td className="px-4 py-3 text-center">
  {progress ? (
   <button
  type="button"
  disabled={progress.belumMengerjakan === 0}
  onClick={() => openProgressModal(item)}
  className={`font-semibold ${
    progress.belumMengerjakan > 0
      ? "text-red-600 hover:text-red-800 hover:underline"
      : "text-green-600"
  }`}
>
  {progress.belumMengerjakan}
</button>
  ) : (
    <span className="text-gray-400">
      ...
    </span>
  )}
</td>

                    <td className="px-4 py-3">
                      {item.status ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>)})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editId === null
                    ? "Tambah Ulangan"
                    : "Edit Ulangan"}
                </h2>

                <p className="text-sm text-gray-500">
                  Isi informasi ulangan.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {/* KODE */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Kode Ulangan
                  </label>

                  <input
                    type="text"
                    name="kode"
                    value={form.kode}
                    onChange={handleChange}
                    placeholder="Contoh: ULG001"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* JUDUL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Judul Ulangan
                  </label>

                  <input
                    type="text"
                    name="judul"
                    value={form.judul}
                    onChange={handleChange}
                    placeholder="Contoh: Ulangan Matematika"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* KELAS */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Kelas
                  </label>

                  <select
                    name="kelasId"
                    value={form.kelasId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- Pilih Kelas --</option>

                    {kelasData.map((kelas) => (
                      <option
                        key={kelas.id}
                        value={kelas.id}
                      >
                        {kelas.kode} - {kelas.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TANGGAL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tanggal & Waktu
                  </label>

                  <input
                    type="datetime-local"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DURASI */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Durasi (Menit)
                  </label>

                  <input
                    type="number"
                    name="durasi"
                    min="1"
                    value={form.durasi}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* STATUS */}
                <div className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />

                  <label className="text-sm font-medium text-gray-700">
                    Ulangan Aktif
                  </label>
                </div>

                {/* DESKRIPSI */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>

                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Deskripsi ulangan (opsional)"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {saving
                    ? "Menyimpan..."
                    : editId === null
                      ? "Simpan"
                      : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* POPUP SISWA BELUM MENGERJAKAN */}
{showProgressModal &&
  selectedUlangan &&
  (() => {
    const progress =
      progressData[selectedUlangan.id];

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Siswa Belum Mengerjakan
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedUlangan.judul}
              </p>

              <p className="text-xs text-gray-400">
                Kelas:{" "}
                {selectedUlangan.kelas.nama}
              </p>
            </div>

            <button
              type="button"
              onClick={closeProgressModal}
              className="text-2xl text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* RINGKASAN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-b bg-gray-50 p-5">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500">
                Total Siswa
              </div>

              <div className="mt-1 text-xl font-bold text-gray-900">
                {progress?.totalSiswa ?? 0}
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500">
                Mengerjakan
              </div>

              <div className="mt-1 text-xl font-bold text-blue-600">
{progress?.mengerjakan ?? 0}
              </div>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
  <div className="text-xs text-gray-500">
    Selesai
  </div>

  <div className="mt-1 text-xl font-bold text-green-600">
    {progress?.selesai ?? 0}
  </div>
</div>

            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500">
                Belum Mengerjakan
              </div>

              <div className="mt-1 text-xl font-bold text-red-600">
                {progress?.belumMengerjakan ?? 0}
              </div>
            </div>
          </div>

          {/* DAFTAR */}
          <div className="max-h-[55vh] overflow-y-auto p-5">
            {!progress ? (
              <div className="py-10 text-center text-gray-500">
                Memuat data...
              </div>
            ) : progress.daftarBelumMengerjakan
                .length === 0 ? (
              <div className="rounded-lg bg-green-50 p-6 text-center">
                <p className="font-semibold text-green-700">
                  Semua siswa sudah mengerjakan
                  ulangan.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">
                        No
                      </th>

                      <th className="px-4 py-3">
                        NIS
                      </th>

                      <th className="px-4 py-3">
                        Nama Siswa
                      </th>

                    <th className="px-4 py-3">
  Nomor WhatsApp
</th>

<th className="px-4 py-3 text-center">
  Aksi
</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {progress.daftarBelumMengerjakan.map(
                      (siswa, index) => (
                        <tr
                          key={siswa.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3">
                            {siswa.nis || "-"}
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-900">
                            {siswa.nama}
                          </td>

                         <td className="px-4 py-3">
  <input
    type="tel"
    placeholder="08xxxxxxxxxx"
    value={nomorWhatsapp[siswa.id] || ""}
    onChange={(e) =>
      setNomorWhatsapp((prev) => ({
        ...prev,
        [siswa.id]: e.target.value,
      }))
    }
    className="w-full min-w-[170px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
  />
</td>

<td className="px-4 py-3 text-center">
  <button
    type="button"
    onClick={() =>
      kirimWhatsApp(
        siswa.id,
        siswa.nama,
      )
    }
    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
  >
    WhatsApp
  </button>
</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={closeProgressModal}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  })()}
    </div>
  );
}