import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Printer, ArrowLeft, Info } from "lucide-react";

import { API_URL } from "../config/api";

// ======================================================
// KONFIGURASI SEKOLAH — SESUAIKAN DENGAN DATA SEKOLAH ANDA
// ======================================================
const NAMA_SEKOLAH = "SMK BP NURHANIFA";
const KOTA_TANDA_TANGAN = "Bogor";
const KEPALA_SEKOLAH = "Adi Fachrudin, S.E";
const WAKASEK_KURIKULUM = "Desinta Setiani, S.S., M.Pd.";

const LOGO_SEKOLAH_SRC = "/sekolah_bp.png";

const PAPER_WIDTH_PX = 794; // 210mm @ 96dpi
const PAPER_ID = "modul-ajar-cetak";

export default function ModulAjarPrintPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState<number | undefined>();

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const computeScale = () => {
      const availableWidth = window.innerWidth - 24;
      const nextScale =
        availableWidth < PAPER_WIDTH_PX
          ? Math.max(availableWidth / PAPER_WIDTH_PX, 0.35)
          : 1;
      setScale(nextScale);
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  useEffect(() => {
    if (paperRef.current) {
      setWrapperHeight(paperRef.current.offsetHeight * scale);
    }
  }, [scale, data]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/modul-ajar/${id}`, {
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
      alert("Gagal mengambil data Modul Ajar");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memuat dokumen...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Data Modul Ajar tidak ditemukan.</p>
      </div>
    );
  }

  const kegiatanAwal =
    data.kegiatanPembelajaran?.filter((item: any) => item.jenis === "Awal") ||
    [];
  const kegiatanInti =
    data.kegiatanPembelajaran?.filter((item: any) => item.jenis === "Inti") ||
    [];
  const kegiatanPenutup =
    data.kegiatanPembelajaran?.filter(
      (item: any) => item.jenis === "Penutup",
    ) || [];

  const totalDurasi = (items: any[]) =>
    items.reduce((acc, item) => acc + (item.durasi || 0), 0);

  const semesterLabel = data.semester?.semester
    ? data.semester.semester.toUpperCase()
    : "-";

  const tahunAjaranLabel = data.semester?.tahunAjaran || "-";

  const bulanTahunTTD = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* ========================= */}
      {/* TOOLBAR (tidak ikut tercetak) */}
      {/* ========================= */}

      <div className="print:hidden sticky top-0 z-50 border-b bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
          >
            <Printer size={18} />
            Cetak / Simpan PDF
          </button>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Info size={14} className="shrink-0" />
          Saat kotak dialog cetak muncul, pilih ukuran kertas{" "}
          <span className="font-medium text-gray-700">A4</span>, orientasi{" "}
          <span className="font-medium text-gray-700">Potret</span>, dan
          margin{" "}
          <span className="font-medium text-gray-700">Default/None</span>{" "}
          untuk hasil terbaik.
        </p>
      </div>

      {/* ========================= */}
      {/* DOKUMEN */}
      {/* ========================= */}

      <div className="preview-backdrop print:bg-white">
        <div
          className="flex flex-col items-center overflow-x-auto px-2 py-10 print:contents"
          style={{ minHeight: wrapperHeight }}
        >
          <span className="print:hidden mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200">
            Pratinjau Dokumen &middot; A4
          </span>

          <div
            ref={paperRef}
            id={PAPER_ID}
            className="doc-font w-[210mm] shrink-0 rounded-sm bg-white px-[18mm] py-[15mm] shadow-[0_2px_6px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.12)] ring-1 ring-gray-200 print:w-auto print:shrink print:rounded-none print:px-0 print:py-0 print:shadow-none print:ring-0"
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          >
            {/* KOP / HEADER */}
            <div className="relative mb-6 flex items-center justify-center gap-4">
              {logoFailed ? (
                <div className="absolute left-0 flex h-20 w-20 items-center justify-center rounded border border-dashed border-gray-300 text-[9px] text-gray-400 print:hidden">
                  LOGO
                </div>
              ) : (
                <img
                  src={LOGO_SEKOLAH_SRC}
                  alt="Logo Sekolah"
                  className="absolute left-0 h-20 w-20 object-contain"
                  onError={() => setLogoFailed(true)}
                />
              )}

              <div className="text-center">
                <h1 className="text-lg font-bold uppercase">
                  MODUL AJAR SEMESTER {semesterLabel}
                </h1>
                <p className="text-lg font-bold uppercase">{NAMA_SEKOLAH}</p>
                <p className="text-lg font-bold uppercase">
                  TAHUN PELAJARAN {tahunAjaranLabel}
                </p>
              </div>
            </div>

            {/* TABEL UTAMA — <table> asli dengan border-collapse supaya
                garis kotak-kotak presisi & konsisten saat dicetak/PDF. */}
            <table className="document-table">
              <tbody>
                <tr>
                  <td colSpan={2} className="section-header">
                    INFORMASI UMUM
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">Nama Penyusun</td>
                  <td>{data.namaPenyusun || "-"}</td>
                </tr>

                <tr>
                  <td className="label-cell">Mata Pelajaran</td>
                  <td>
                    {data.mataPelajaran?.kode
                      ? `${data.mataPelajaran.kode} - ${data.mataPelajaran.nama}`
                      : data.mataPelajaran?.nama || "-"}
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">Program Keahlian</td>
                  <td>{data.programKeahlian || "-"}</td>
                </tr>

                <tr>
                  <td className="label-cell">Judul Elemen</td>
                  <td>{data.judulElemen || "-"}</td>
                </tr>

                <tr>
                  <td className="label-cell">Capaian Pembelajaran (CP)</td>
                  <td className="whitespace-pre-wrap">
                    {data.capaianPembelajaran || "-"}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="section-header">
                    KOMPONEN INTI
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">Tujuan Pembelajaran</td>
                  <td>
                    {data.tujuanPembelajaran?.length ? (
                      <ol className="list-decimal space-y-1 pl-4">
                        {data.tujuanPembelajaran.map(
                          (item: any, index: number) => (
                            <li key={item.id || index}>{item.tujuan}</li>
                          ),
                        )}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="section-header">
                    KEGIATAN PEMBELAJARAN
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">
                    Kegiatan Awal ({totalDurasi(kegiatanAwal) || "..."} Menit)
                  </td>
                  <td>
                    {kegiatanAwal.length ? (
                      <ol className="list-decimal space-y-1 pl-4">
                        {kegiatanAwal.map((item: any, index: number) => (
                          <li key={item.id || index}>{item.aktivitas}</li>
                        ))}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">
                    Kegiatan Inti ({totalDurasi(kegiatanInti) || "..."} Menit)
                  </td>
                  <td>
                    {kegiatanInti.length ? (
                      <ol className="list-decimal space-y-1 pl-4">
                        {kegiatanInti.map((item: any, index: number) => (
                          <li key={item.id || index}>{item.aktivitas}</li>
                        ))}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">
                    Kegiatan Penutup ({totalDurasi(kegiatanPenutup) || "..."}{" "}
                    Menit)
                  </td>
                  <td>
                    {kegiatanPenutup.length ? (
                      <ol className="list-decimal space-y-1 pl-4">
                        {kegiatanPenutup.map((item: any, index: number) => (
                          <li key={item.id || index}>{item.aktivitas}</li>
                        ))}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="section-header">
                    ASESMEN
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">Asesmen</td>
                  <td>
                    {data.asesmen?.length ? (
                      <ol className="list-decimal space-y-1 pl-4">
                        {data.asesmen.map((item: any, index: number) => (
                          <li key={item.id || index}>
                            {item.jenis ? `${item.jenis}: ` : ""}
                            {item.deskripsi || "-"}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">Pengayaan dan Remedial</td>
                  <td className="whitespace-pre-wrap">
                    <span className="font-semibold">Pengayaan: </span>
                    {data.pengayaan || "-"}
                    <br />
                    <span className="font-semibold">Remedial: </span>
                    {data.remedial || "-"}
                  </td>
                </tr>

                <tr>
                  <td className="label-cell">
                    Refleksi Peserta Didik dan Guru
                  </td>
                  <td className="whitespace-pre-wrap">
                    <span className="font-semibold">Peserta Didik: </span>
                    {data.refleksiPesertaDidik || "-"}
                    <br />
                    <span className="font-semibold">Guru: </span>
                    {data.refleksiGuru || "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TANGGAL */}
            <div className="mt-8 text-right text-sm">
              <p>
                {KOTA_TANDA_TANGAN}, .......... {bulanTahunTTD}
              </p>
            </div>

            {/* TANDA TANGAN */}
            <div className="ttd-block mt-4 text-sm">
              <p className="font-semibold">Mengetahui,</p>

              <div className="mt-3 flex gap-6">
                <p className="flex-1 font-semibold">Kepala Sekolah</p>
                <p className="flex-1 font-semibold">Wakasek Bid. Kurikulum</p>
                <p className="flex-1 font-semibold">Guru Mapel</p>
              </div>

              <div className="flex gap-6">
                <div className="h-20 flex-1" />
                <div className="h-20 flex-1" />
                <div className="h-20 flex-1" />
              </div>

              <div className="flex gap-6">
                <p className="flex-1 font-semibold">{KEPALA_SEKOLAH}</p>
                <p className="flex-1 font-semibold">{WAKASEK_KURIKULUM}</p>
                <p className="flex-1 font-semibold">
                  {data.namaPenyusun || "..................."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* PRINT CSS */}
      {/* ========================= */}

      <style>{`
        .doc-font {
          font-family: "Times New Roman", Times, serif;
        }

        .preview-backdrop {
          background-color: #eceef1;
        }

        /* --- Tabel asli dengan border-collapse: garis presisi & konsisten --- */
        .document-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          line-height: 1.5;
        }

        .document-table th,
        .document-table td {
          border: 1px solid #000;
          padding: 7px 9px;
          vertical-align: top;
          break-inside: avoid;
          break-inside: avoid-page;
          page-break-inside: avoid;
        }

        .document-table tr {
          break-inside: avoid;
          break-inside: avoid-page;
          page-break-inside: avoid;
        }

        .section-header {
          text-align: center;
          font-weight: 700;
          background: #f2f2f2;
        }

        .label-cell {
          width: 32%;
          font-weight: 600;
        }

        .ttd-block {
          break-inside: avoid;
          break-inside: avoid-page;
          page-break-inside: avoid;
        }

        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .preview-backdrop {
            background: white !important;
          }

          /* Cetak HANYA dokumen ini, sembunyikan sisa halaman. */
          body * {
            visibility: hidden;
          }

          #${PAPER_ID},
          #${PAPER_ID} * {
            visibility: visible;
          }

          #${PAPER_ID} {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 210mm !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15mm 18mm !important;
          }

          /* Pastikan warna latar section header ikut tercetak di semua browser */
          .section-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          h1, h2, h3 {
            break-after: avoid;
          }
        }
      `}</style>
    </>
  );
}
