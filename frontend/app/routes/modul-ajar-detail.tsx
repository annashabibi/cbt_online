import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Pencil,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "../config/api";

interface TujuanPembelajaran {
  id: number;
  tujuan: string;
  urutan: number;
}

interface KegiatanPembelajaran {
  id: number;
  jenis: string;
  aktivitas: string;
  durasi: number | null;
  urutan: number;
}

interface Asesmen {
  id: number;
  jenis: string;
  deskripsi: string;
  urutan: number;
}

interface ModulAjar {
  id: number;
  namaPenyusun: string;
  programKeahlian: string | null;
  judulElemen: string | null;
  capaianPembelajaran: string | null;

  kelas: {
    id: number;
    kode: string;
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

  tujuanPembelajaran: TujuanPembelajaran[];
  kegiatanPembelajaran: KegiatanPembelajaran[];
  asesmen: Asesmen[];

  pengayaan: string | null;
  remedial: string | null;
  refleksiPesertaDidik: string | null;
  refleksiGuru: string | null;
}

export default function ModulAjarDetailPage() {
  const { id } = useParams();

  const [data, setData] = useState<ModulAjar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/modul-ajar/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data Modul Ajar...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
          Data Modul Ajar tidak ditemukan.
        </div>
      </div>
    );
  }

  const kegiatanAwal = data.kegiatanPembelajaran.filter(
    (item) => item.jenis === "Awal",
  );

  const kegiatanInti = data.kegiatanPembelajaran.filter(
    (item) => item.jenis === "Inti",
  );

  const kegiatanPenutup = data.kegiatanPembelajaran.filter(
    (item) => item.jenis === "Penutup",
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Detail Modul Ajar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Detail dokumen pembelajaran
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/modul-ajar"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>

          <Link
            to={`/modul-ajar/${data.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
          >
            <Pencil size={18} />
            Edit
          </Link>

          <Link
            to={`/modul-ajar/${data.id}/print`}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
          >
            <Printer size={18} />
            Print
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* INFORMASI UMUM */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Informasi Umum
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <InfoItem
              label="Nama Penyusun"
              value={data.namaPenyusun}
            />

            <InfoItem
              label="Mata Pelajaran"
              value={`${data.mataPelajaran.kode} - ${data.mataPelajaran.nama}`}
              icon={<GraduationCap size={17} />}
            />

            <InfoItem
              label="Program Keahlian"
              value={data.programKeahlian || "-"}
            />

            <InfoItem
              label="Kelas"
              value={`${data.kelas.kode} - ${data.kelas.nama}`}
            />

            <InfoItem
              label="Judul Elemen"
              value={data.judulElemen || "-"}
            />

            <InfoItem
              label="Tahun Ajaran / Semester"
              value={`${data.semester.tahunAjaran} - ${data.semester.semester}`}
              icon={<CalendarDays size={17} />}
            />
          </div>

          <div className="border-t border-gray-100 p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Capaian Pembelajaran
            </h3>

            <div className="whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700">
              {data.capaianPembelajaran || "-"}
            </div>
          </div>
        </section>

        {/* TUJUAN PEMBELAJARAN */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Tujuan Pembelajaran
            </h2>
          </div>

          <div className="p-6">
            {data.tujuanPembelajaran.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada tujuan pembelajaran.
              </p>
            ) : (
              <div className="space-y-3">
                {data.tujuanPembelajaran.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
                      {index + 1}
                    </div>

                    <p className="whitespace-pre-line pt-1 text-sm leading-6 text-gray-700">
                      {item.tujuan}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* KEGIATAN PEMBELAJARAN */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Kegiatan Pembelajaran
            </h2>
          </div>

          <div className="space-y-6 p-6">
            <KegiatanSection
              title="Kegiatan Awal"
              data={kegiatanAwal}
            />

            <KegiatanSection
              title="Kegiatan Inti"
              data={kegiatanInti}
            />

            <KegiatanSection
              title="Kegiatan Penutup"
              data={kegiatanPenutup}
            />
          </div>
        </section>

        {/* ASESMEN */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Asesmen
            </h2>
          </div>

          <div className="p-6">
            {data.asesmen.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada asesmen.
              </p>
            ) : (
              <div className="space-y-4">
                {data.asesmen.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">
                        {index + 1}
                      </span>

                      <span className="font-semibold text-gray-800">
                        {item.jenis || "Asesmen"}
                      </span>
                    </div>

                    <p className="whitespace-pre-line pl-10 text-sm leading-6 text-gray-600">
                      {item.deskripsi}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PENGAYAAN DAN REMEDIAL */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Pengayaan dan Remedial
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <TextSection
              title="Pengayaan"
              value={data.pengayaan}
            />

            <TextSection
              title="Remedial"
              value={data.remedial}
            />
          </div>
        </section>

        {/* REFLEKSI */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Refleksi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <TextSection
              title="Refleksi Peserta Didik"
              value={data.refleksiPesertaDidik}
            />

            <TextSection
              title="Refleksi Guru"
              value={data.refleksiGuru}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========================= */
/* COMPONENT INFO */
/* ========================= */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 p-6 md:[&:nth-child(odd)]:border-r">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {icon}
        {label}
      </div>

      <div className="text-sm font-medium leading-6 text-gray-800">
        {value}
      </div>
    </div>
  );
}

/* ========================= */
/* KEGIATAN */
/* ========================= */

function KegiatanSection({
  title,
  data,
}: {
  title: string;
  data: KegiatanPembelajaran[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-yellow-400" />

        <h3 className="font-semibold text-gray-800">
          {title}
        </h3>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-400">
          Belum ada kegiatan.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:flex-row"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-500">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                  {item.aktivitas}
                </p>
              </div>

              {item.durasi !== null && (
                <div className="shrink-0 text-xs font-medium text-gray-500">
                  {item.durasi} menit
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= */
/* TEXT SECTION */
/* ========================= */

function TextSection({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        {title}
      </h3>

      <div className="min-h-[100px] whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
        {value || "-"}
      </div>
    </div>
  );
}