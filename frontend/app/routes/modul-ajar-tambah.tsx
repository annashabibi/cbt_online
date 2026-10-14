import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config/api";

interface Kelas {
  id: number;
  nama: string;
}

interface MataPelajaran {
  id: number;
  kode: string;
  nama: string;
}

interface Semester {
  id: number;
  tahunAjaran: string;
  semester: string;
}

interface Tujuan {
  tujuan: string;
}

interface Kegiatan {
  jenis: string;
  aktivitas: string;
  durasi: string;
}

interface Asesmen {
  jenis: string;
  deskripsi: string;
}

export default function ModulAjarTambahPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [semester, setSemester] = useState<Semester[]>([]);

  const [form, setForm] = useState({
    namaPenyusun: "",
    programKeahlian: "",
    judulElemen: "",
    capaianPembelajaran: "",
    kelasId: "",
    mataPelajaranId: "",
    semesterId: "",
    pengayaan: "",
    remedial: "",
    refleksiPesertaDidik: "",
    refleksiGuru: "",
  });

  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<Tujuan[]>([
    { tujuan: "" },
  ]);

  const [kegiatanPembelajaran, setKegiatanPembelajaran] = useState<Kegiatan[]>([
    {
      jenis: "Awal",
      aktivitas: "",
      durasi: "",
    },
    {
      jenis: "Inti",
      aktivitas: "",
      durasi: "",
    },
    {
      jenis: "Penutup",
      aktivitas: "",
      durasi: "",
    },
  ]);

  const [asesmen, setAsesmen] = useState<Asesmen[]>([
    {
      jenis: "",
      deskripsi: "",
    },
  ]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoadingMaster(true);

      const token = localStorage.getItem("accessToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [kelasRes, mapelRes, semesterRes] = await Promise.all([
        fetch(`${API_URL}/kelas`, { headers }),
        fetch(`${API_URL}/mata-pelajaran`, { headers }),
        fetch(`${API_URL}/semester`, { headers }),
      ]);

      if (!kelasRes.ok) {
        throw new Error("Gagal mengambil data kelas");
      }

      if (!mapelRes.ok) {
        throw new Error("Gagal mengambil data mata pelajaran");
      }

      if (!semesterRes.ok) {
        throw new Error("Gagal mengambil data semester");
      }

      const kelasData = await kelasRes.json();
      const mapelData = await mapelRes.json();
      const semesterData = await semesterRes.json();

      setKelas(Array.isArray(kelasData) ? kelasData : kelasData.data || []);
      setMataPelajaran(
        Array.isArray(mapelData) ? mapelData : mapelData.data || []
      );
      setSemester(
        Array.isArray(semesterData)
          ? semesterData
          : semesterData.data || []
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data master");
    } finally {
      setLoadingMaster(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TUJUAN PEMBELAJARAN
  // =========================

  const tambahTujuan = () => {
    setTujuanPembelajaran((prev) => [
      ...prev,
      {
        tujuan: "",
      },
    ]);
  };

  const hapusTujuan = (index: number) => {
    if (tujuanPembelajaran.length === 1) {
      toast.warning("Minimal satu tujuan pembelajaran");
      return;
    }

    setTujuanPembelajaran((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const ubahTujuan = (index: number, value: string) => {
    setTujuanPembelajaran((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              tujuan: value,
            }
          : item
      )
    );
  };

  // =========================
  // KEGIATAN PEMBELAJARAN
  // =========================

  const tambahKegiatan = (jenis = "Inti") => {
    setKegiatanPembelajaran((prev) => [
      ...prev,
      {
        jenis,
        aktivitas: "",
        durasi: "",
      },
    ]);
  };

  const hapusKegiatan = (index: number) => {
    setKegiatanPembelajaran((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const ubahKegiatan = (
    index: number,
    field: keyof Kegiatan,
    value: string
  ) => {
    setKegiatanPembelajaran((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // =========================
  // ASESMEN
  // =========================

  const tambahAsesmen = () => {
    setAsesmen((prev) => [
      ...prev,
      {
        jenis: "",
        deskripsi: "",
      },
    ]);
  };

  const hapusAsesmen = (index: number) => {
    if (asesmen.length === 1) {
      toast.warning("Minimal satu asesmen");
      return;
    }

    setAsesmen((prev) => prev.filter((_, i) => i !== index));
  };

  const ubahAsesmen = (
    index: number,
    field: keyof Asesmen,
    value: string
  ) => {
    setAsesmen((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.namaPenyusun.trim()) {
      toast.error("Nama penyusun wajib diisi");
      return;
    }

    if (!form.kelasId) {
      toast.error("Kelas wajib dipilih");
      return;
    }

    if (!form.mataPelajaranId) {
      toast.error("Mata pelajaran wajib dipilih");
      return;
    }

    if (!form.semesterId) {
      toast.error("Semester wajib dipilih");
      return;
    }

    const tujuanValid = tujuanPembelajaran.filter(
      (item) => item.tujuan.trim() !== ""
    );

    if (tujuanValid.length === 0) {
      toast.error("Minimal satu tujuan pembelajaran harus diisi");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const payload = {
        ...form,

        kelasId: Number(form.kelasId),
        mataPelajaranId: Number(form.mataPelajaranId),
        semesterId: Number(form.semesterId),

        tujuanPembelajaran: tujuanValid.map((item, index) => ({
          tujuan: item.tujuan,
          urutan: index + 1,
        })),

        kegiatanPembelajaran: kegiatanPembelajaran
          .filter((item) => item.aktivitas.trim() !== "")
          .map((item, index) => ({
            jenis: item.jenis,
            aktivitas: item.aktivitas,
            durasi: item.durasi
              ? Number(item.durasi)
              : null,
            urutan: index + 1,
          })),

        asesmen: asesmen
          .filter((item) => item.deskripsi.trim() !== "")
          .map((item, index) => ({
            jenis: item.jenis,
            deskripsi: item.deskripsi,
            urutan: index + 1,
          })),
      };

      const response = await fetch(`${API_URL}/modul-ajar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            "Gagal menyimpan Modul Ajar"
        );
      }

      toast.success("Modul Ajar berhasil disimpan");

      setTimeout(() => {
        navigate("/modul-ajar");
      }, 500);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message || "Gagal menyimpan Modul Ajar"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingMaster) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tambah Modul Ajar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Buat Modul Ajar / RPP baru
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/modul-ajar")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================= */}
        {/* INFORMASI UMUM */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Informasi Umum
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Informasi dasar Modul Ajar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Penyusun <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="namaPenyusun"
                value={form.namaPenyusun}
                onChange={handleChange}
                placeholder="Masukkan nama penyusun"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Program Keahlian
              </label>

              <input
                type="text"
                name="programKeahlian"
                value={form.programKeahlian}
                onChange={handleChange}
                placeholder="Contoh: Desain Komunikasi Visual"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>

              <select
                name="mataPelajaranId"
                value={form.mataPelajaranId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>

                {mataPelajaran.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.kode} - {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kelas <span className="text-red-500">*</span>
              </label>

              <select
                name="kelasId"
                value={form.kelasId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              >
                <option value="">-- Pilih Kelas --</option>

                {kelas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tahun Ajaran / Semester{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="semesterId"
                value={form.semesterId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              >
                <option value="">-- Pilih Semester --</option>

                {semester.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tahunAjaran} - {item.semester}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Judul Elemen
              </label>

              <input
                type="text"
                name="judulElemen"
                value={form.judulElemen}
                onChange={handleChange}
                placeholder="Masukkan judul elemen"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Capaian Pembelajaran
            </label>

            <textarea
              name="capaianPembelajaran"
              value={form.capaianPembelajaran}
              onChange={handleChange}
              rows={5}
              placeholder="Tuliskan capaian pembelajaran..."
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            />
          </div>
        </div>

        {/* ========================= */}
        {/* TUJUAN PEMBELAJARAN */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Tujuan Pembelajaran
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tambahkan tujuan pembelajaran sesuai kebutuhan
              </p>
            </div>

            <button
              type="button"
              onClick={tambahTujuan}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
            >
              <Plus size={17} />
              Tambah
            </button>
          </div>

          <div className="space-y-3">
            {tujuanPembelajaran.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>

                <textarea
                  value={item.tujuan}
                  onChange={(e) =>
                    ubahTujuan(index, e.target.value)
                  }
                  rows={2}
                  placeholder="Tuliskan tujuan pembelajaran..."
                  className="min-w-0 flex-1 resize-y rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />

                <button
                  type="button"
                  onClick={() => hapusTujuan(index)}
                  className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ========================= */}
        {/* KEGIATAN PEMBELAJARAN */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Kegiatan Pembelajaran
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Atur kegiatan awal, inti, dan penutup
              </p>
            </div>

            <button
              type="button"
              onClick={() => tambahKegiatan("Inti")}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
            >
              <Plus size={17} />
              Tambah Kegiatan
            </button>
          </div>

          <div className="space-y-4">
            {kegiatanPembelajaran.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr_120px_auto]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                      Tahapan
                    </label>

                    <select
                      value={item.jenis}
                      onChange={(e) =>
                        ubahKegiatan(
                          index,
                          "jenis",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                    >
                      <option value="Awal">Awal</option>
                      <option value="Inti">Inti</option>
                      <option value="Penutup">Penutup</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                      Aktivitas
                    </label>

                    <textarea
                      value={item.aktivitas}
                      onChange={(e) =>
                        ubahKegiatan(
                          index,
                          "aktivitas",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Deskripsikan aktivitas pembelajaran..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                      Durasi (Menit)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={item.durasi}
                      onChange={(e) =>
                        ubahKegiatan(
                          index,
                          "durasi",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: 15"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => hapusKegiatan(index)}
                      className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================= */}
        {/* ASESMEN */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Asesmen
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tambahkan jenis dan deskripsi asesmen
              </p>
            </div>

            <button
              type="button"
              onClick={tambahAsesmen}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
            >
              <Plus size={17} />
              Tambah
            </button>
          </div>

          <div className="space-y-4">
            {asesmen.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-[220px_1fr_auto]"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                    Jenis Asesmen
                  </label>

                  <input
                    type="text"
                    value={item.jenis}
                    onChange={(e) =>
                      ubahAsesmen(
                        index,
                        "jenis",
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Formatif"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                    Deskripsi
                  </label>

                  <textarea
                    value={item.deskripsi}
                    onChange={(e) =>
                      ubahAsesmen(
                        index,
                        "deskripsi",
                        e.target.value
                      )
                    }
                    rows={2}
                    placeholder="Deskripsikan asesmen..."
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => hapusAsesmen(index)}
                    className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================= */}
        {/* PENGAYAAN & REMEDIAL */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Pengayaan dan Remedial
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pengayaan
              </label>

              <textarea
                name="pengayaan"
                value={form.pengayaan}
                onChange={handleChange}
                rows={4}
                placeholder="Tuliskan kegiatan pengayaan..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Remedial
              </label>

              <textarea
                name="remedial"
                value={form.remedial}
                onChange={handleChange}
                rows={4}
                placeholder="Tuliskan kegiatan remedial..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* REFLEKSI */}
        {/* ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Refleksi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Refleksi Peserta Didik
              </label>

              <textarea
                name="refleksiPesertaDidik"
                value={form.refleksiPesertaDidik}
                onChange={handleChange}
                rows={4}
                placeholder="Tuliskan refleksi peserta didik..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Refleksi Guru
              </label>

              <textarea
                name="refleksiGuru"
                value={form.refleksiGuru}
                onChange={handleChange}
                rows={4}
                placeholder="Tuliskan refleksi guru..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* BUTTON */}
        {/* ========================= */}

        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/modul-ajar")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {loading ? "Menyimpan..." : "Simpan Modul Ajar"}
          </button>
        </div>
      </form>
    </div>
  );
}