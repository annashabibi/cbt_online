import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "../config/api";

interface Kelas {
  id: number;
  kode: string;
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

export default function ModulAjarEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<Tujuan[]>([]);

  const [kegiatanPembelajaran, setKegiatanPembelajaran] = useState<Kegiatan[]>(
    [],
  );

  const [asesmen, setAsesmen] = useState<Asesmen[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const headers = getHeaders();

      const [modulRes, kelasRes, mapelRes, semesterRes] =
        await Promise.all([
          fetch(`${API_URL}/modul-ajar/${id}`, { headers }),
          fetch(`${API_URL}/kelas`, { headers }),
          fetch(`${API_URL}/mata-pelajaran`, { headers }),
          fetch(`${API_URL}/semester`, { headers }),
        ]);

      if (!modulRes.ok) {
        throw new Error("Gagal mengambil Modul Ajar");
      }

      if (!kelasRes.ok) {
        throw new Error("Gagal mengambil data kelas");
      }

      if (!mapelRes.ok) {
        throw new Error("Gagal mengambil data mata pelajaran");
      }

      if (!semesterRes.ok) {
        throw new Error("Gagal mengambil data semester");
      }

      const modul = await modulRes.json();
      const kelasData = await kelasRes.json();
      const mapelData = await mapelRes.json();
      const semesterData = await semesterRes.json();

      setKelas(
        Array.isArray(kelasData)
          ? kelasData
          : kelasData.data || [],
      );

      setMataPelajaran(
        Array.isArray(mapelData)
          ? mapelData
          : mapelData.data || [],
      );

      setSemester(
        Array.isArray(semesterData)
          ? semesterData
          : semesterData.data || [],
      );

      setForm({
        namaPenyusun: modul.namaPenyusun || "",
        programKeahlian: modul.programKeahlian || "",
        judulElemen: modul.judulElemen || "",
        capaianPembelajaran:
          modul.capaianPembelajaran || "",
        kelasId: String(modul.kelasId),
        mataPelajaranId: String(modul.mataPelajaranId),
        semesterId: String(modul.semesterId),
        pengayaan: modul.pengayaan || "",
        remedial: modul.remedial || "",
        refleksiPesertaDidik:
          modul.refleksiPesertaDidik || "",
        refleksiGuru: modul.refleksiGuru || "",
      });

      setTujuanPembelajaran(
        (modul.tujuanPembelajaran || []).map(
          (item: any) => ({
            tujuan: item.tujuan || "",
          }),
        ),
      );

      setKegiatanPembelajaran(
        (modul.kegiatanPembelajaran || []).map(
          (item: any) => ({
            jenis: item.jenis || "Inti",
            aktivitas: item.aktivitas || "",
            durasi:
              item.durasi !== null &&
              item.durasi !== undefined
                ? String(item.durasi)
                : "",
          }),
        ),
      );

      setAsesmen(
        (modul.asesmen || []).map((item: any) => ({
          jenis: item.jenis || "",
          deskripsi: item.deskripsi || "",
        })),
      );
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TUJUAN
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
    setTujuanPembelajaran((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const ubahTujuan = (
    index: number,
    value: string,
  ) => {
    setTujuanPembelajaran((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              tujuan: value,
            }
          : item,
      ),
    );
  };

  // =========================
  // KEGIATAN
  // =========================

  const tambahKegiatan = (
    jenis = "Inti",
  ) => {
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
      prev.filter((_, i) => i !== index),
    );
  };

  const ubahKegiatan = (
    index: number,
    field: keyof Kegiatan,
    value: string,
  ) => {
    setKegiatanPembelajaran((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
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
    setAsesmen((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const ubahAsesmen = (
    index: number,
    field: keyof Asesmen,
    value: string,
  ) => {
    setAsesmen((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // =========================
  // SIMPAN
  // =========================

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
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

    const tujuanValid =
      tujuanPembelajaran.filter(
        (item) => item.tujuan.trim() !== "",
      );

    if (tujuanValid.length === 0) {
      toast.error(
        "Minimal satu tujuan pembelajaran harus diisi",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,

        kelasId: Number(form.kelasId),
        mataPelajaranId: Number(
          form.mataPelajaranId,
        ),
        semesterId: Number(form.semesterId),

        tujuanPembelajaran: tujuanValid.map(
          (item, index) => ({
            tujuan: item.tujuan,
            urutan: index + 1,
          }),
        ),

        kegiatanPembelajaran:
          kegiatanPembelajaran
            .filter(
              (item) =>
                item.aktivitas.trim() !== "",
            )
            .map((item, index) => ({
              jenis: item.jenis,
              aktivitas: item.aktivitas,
              durasi: item.durasi
                ? Number(item.durasi)
                : null,
              urutan: index + 1,
            })),

        asesmen: asesmen
          .filter(
            (item) =>
              item.deskripsi.trim() !== "",
          )
          .map((item, index) => ({
            jenis: item.jenis,
            deskripsi: item.deskripsi,
            urutan: index + 1,
          })),
      };

      const response = await fetch(
        `${API_URL}/modul-ajar/${id}`,
        {
          method: "PATCH",
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => null);

        throw new Error(
          result?.message ||
            "Gagal menyimpan perubahan",
        );
      }

      toast.success(
        "Modul Ajar berhasil diperbarui",
      );

      setTimeout(() => {
        navigate(`/modul-ajar/${id}`);
      }, 500);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan perubahan",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat Modul Ajar...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Modul Ajar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Ubah data Modul Ajar
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/modul-ajar/${id}`)
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* INFORMASI UMUM */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Informasi Umum
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Nama Penyusun"
              name="namaPenyusun"
              value={form.namaPenyusun}
              onChange={handleChange}
              required
            />

            <Input
              label="Program Keahlian"
              name="programKeahlian"
              value={form.programKeahlian}
              onChange={handleChange}
            />

            <Select
              label="Mata Pelajaran"
              name="mataPelajaranId"
              value={form.mataPelajaranId}
              onChange={handleChange}
              required
            >
              <option value="">
                -- Pilih Mata Pelajaran --
              </option>

              {mataPelajaran.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.kode} - {item.nama}
                </option>
              ))}
            </Select>

            <Select
              label="Kelas"
              name="kelasId"
              value={form.kelasId}
              onChange={handleChange}
              required
            >
              <option value="">
                -- Pilih Kelas --
              </option>

              {kelas.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.kode} - {item.nama}
                </option>
              ))}
            </Select>

            <Select
              label="Tahun Ajaran / Semester"
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              required
            >
              <option value="">
                -- Pilih Semester --
              </option>

              {semester.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.tahunAjaran} -{" "}
                  {item.semester}
                </option>
              ))}
            </Select>

            <Input
              label="Judul Elemen"
              name="judulElemen"
              value={form.judulElemen}
              onChange={handleChange}
            />
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
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            />
          </div>
        </section>

        {/* TUJUAN */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Tujuan Pembelajaran
              </h2>
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
            {tujuanPembelajaran.length ===
            0 ? (
              <p className="text-sm text-gray-500">
                Belum ada tujuan pembelajaran.
              </p>
            ) : (
              tujuanPembelajaran.map(
                (item, index) => (
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
                        ubahTujuan(
                          index,
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="min-w-0 flex-1 resize-y rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        hapusTujuan(index)
                      }
                      className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        {/* KEGIATAN */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Kegiatan Pembelajaran
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                tambahKegiatan("Inti")
              }
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
            >
              <Plus size={17} />
              Tambah Kegiatan
            </button>
          </div>

          <div className="space-y-4">
            {kegiatanPembelajaran.length ===
            0 ? (
              <p className="text-sm text-gray-500">
                Belum ada kegiatan pembelajaran.
              </p>
            ) : (
              kegiatanPembelajaran.map(
                (item, index) => (
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
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                        >
                          <option value="Awal">
                            Awal
                          </option>
                          <option value="Inti">
                            Inti
                          </option>
                          <option value="Penutup">
                            Penutup
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                          Aktivitas
                        </label>

                        <textarea
                          value={
                            item.aktivitas
                          }
                          onChange={(e) =>
                            ubahKegiatan(
                              index,
                              "aktivitas",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
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
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            hapusKegiatan(
                              index,
                            )
                          }
                          className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        {/* ASESMEN */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Asesmen
              </h2>
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
            {asesmen.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada asesmen.
              </p>
            ) : (
              asesmen.map((item, index) => (
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
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                      Deskripsi
                    </label>

                    <textarea
                      value={
                        item.deskripsi
                      }
                      onChange={(e) =>
                        ubahAsesmen(
                          index,
                          "deskripsi",
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        hapusAsesmen(index)
                      }
                      className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PENGAYAAN REMEDIAL */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 border-b border-gray-100 pb-4 text-lg font-semibold text-gray-800">
            Pengayaan dan Remedial
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextArea
              label="Pengayaan"
              name="pengayaan"
              value={form.pengayaan}
              onChange={handleChange}
            />

            <TextArea
              label="Remedial"
              name="remedial"
              value={form.remedial}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* REFLEKSI */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 border-b border-gray-100 pb-4 text-lg font-semibold text-gray-800">
            Refleksi
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextArea
              label="Refleksi Peserta Didik"
              name="refleksiPesertaDidik"
              value={form.refleksiPesertaDidik}
              onChange={handleChange}
            />

            <TextArea
              label="Refleksi Guru"
              name="refleksiGuru"
              value={form.refleksiGuru}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* BUTTON */}

        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() =>
              navigate(`/modul-ajar/${id}`)
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================= */
/* INPUT */
/* ========================= */

function Input({
  label,
  name,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
      />
    </div>
  );
}

/* ========================= */
/* SELECT */
/* ========================= */

function Select({
  label,
  name,
  value,
  onChange,
  required = false,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
      >
        {children}
      </select>
    </div>
  );
}

/* ========================= */
/* TEXTAREA */
/* ========================= */

function TextArea({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
      />
    </div>
  );
}