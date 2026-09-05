import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { API_URL } from "../config/api";

// ================= TYPES =================
type Kelas = { id: number; kode: string; nama: string };
type MataPelajaran = { id: number; kode: string; nama: string };
type Semester = { id: number; tahunAjaran: string; semester: string };
type Siswa = { id: number; nis: string; nama: string; jk: string; kelasId: number };
type Pertemuan = { id: number; pertemuanKe: number; tanggal: string };
type AbsensiData = { id: number; absensiPertemuanId: number; siswaId: number; status: string | null };
type StatusKehadiran = "H" | "I" | "S" | "A";

type ActiveCell = {
  siswaId: number;
  pertemuanKe: number;
  pertemuanId: number;
  top: number;
  left: number;
};

const TOTAL_PERTEMUAN_MAX = 40;

const STATUS_CONFIG: Record<
  StatusKehadiran,
  { label: string; text: string; dot: string; badge: string }
> = {
  H: {
    label: "Hadir",
    text: "text-green-600",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  },
  I: {
    label: "Izin",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  S: {
    label: "Sakit",
    text: "text-blue-600",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  A: {
    label: "Alpa",
    text: "text-red-600",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
};

export default function Absensi() {
  const token = localStorage.getItem("accessToken");

  // ---- Master data ----
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [semester, setSemester] = useState<Semester[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // ---- Filter ----
  const [kelasId, setKelasId] = useState("");
  const [mataPelajaranId, setMataPelajaranId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [searchSiswa, setSearchSiswa] = useState("");
  const [namaGuru, setNamaGuru] = useState("");

  // ---- Siswa & absensi ----
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  const [pertemuan, setPertemuan] = useState<Pertemuan[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [isLoadingAbsensi, setIsLoadingAbsensi] = useState(false);

  // ---- Modal tambah/edit pertemuan ----
  const [tanggalPertemuan, setTanggalPertemuan] = useState("");
  const [showPertemuanModal, setShowPertemuanModal] = useState(false);
  const [editPertemuanId, setEditPertemuanId] = useState<number | null>(null);

  // ---- Popover pilih status ----
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);

  const isFilterComplete = Boolean(kelasId && mataPelajaranId && semesterId);

  // ================= FETCH MASTER DATA =================
  useEffect(() => {
    if (!token) return;

    setIsLoadingMaster(true);

    Promise.all([
      fetch(`${API_URL}/kelas`, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
        res.json(),
      ),
      fetch(`${API_URL}/mata-pelajaran`, { headers: { Authorization: `Bearer ${token}` } }).then(
        (res) => res.json(),
      ),
      fetch(`${API_URL}/semester`, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
        res.json(),
      ),
    ])
      .then(([kelasData, mataPelajaranData, semesterData]) => {
        setKelas(kelasData);
        setMataPelajaran(mataPelajaranData);
        setSemester(semesterData);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Gagal memuat data awal", {
          description: "Periksa koneksi internet Anda dan coba lagi.",
        });
      })
      .finally(() => setIsLoadingMaster(false));
  }, [token]);

  // ================= FETCH SISWA =================
  useEffect(() => {
    if (!token || !kelasId) {
      setSiswa([]);
      return;
    }

    setIsLoadingSiswa(true);

    fetch(`${API_URL}/absensi/siswa?kelasId=${kelasId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSiswa(data))
      .catch((error) => {
        console.error(error);
        toast.error("Gagal memuat data siswa");
      })
      .finally(() => setIsLoadingSiswa(false));
  }, [kelasId, token]);

  // ================= FETCH PERTEMUAN & ABSENSI =================
  useEffect(() => {
    if (!token || !kelasId || !mataPelajaranId || !semesterId) {
      setPertemuan([]);
      setAbsensiData([]);
      return;
    }

    setIsLoadingAbsensi(true);

    fetch(
      `${API_URL}/absensi/pertemuan?kelasId=${kelasId}&mataPelajaranId=${mataPelajaranId}&semesterId=${semesterId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((res) => res.json())
      .then(async (data: Pertemuan[]) => {
        setPertemuan(data);

        // Ambil absensi semua pertemuan secara paralel (bukan berurutan) supaya lebih cepat.
        const hasil = await Promise.all(
          data.map((item) =>
            fetch(`${API_URL}/absensi/pertemuan/${item.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
          ),
        );

        setAbsensiData(hasil.flat());
      })
      .catch((error) => {
        console.error(error);
        toast.error("Gagal memuat data absensi");
      })
      .finally(() => setIsLoadingAbsensi(false));
  }, [kelasId, mataPelajaranId, semesterId, token]);

  // ================= HELPERS =================
  const getPertemuanByKe = (pertemuanKe: number) =>
    pertemuan.find((item) => item.pertemuanKe === pertemuanKe);

  const getStatus = (siswaId: number, pertemuanKe: number): StatusKehadiran | null => {
    const p = getPertemuanByKe(pertemuanKe);
    if (!p) return null;

    const data = absensiData.find(
      (item) => item.siswaId === siswaId && item.absensiPertemuanId === p.id,
    );

    return (data?.status as StatusKehadiran | null) ?? null;
  };

  const getRekapSiswa = (siswaId: number) => {
    const data = absensiData.filter((item) => item.siswaId === siswaId);

    const hadir = data.filter((item) => item.status === "H").length;
    const izin = data.filter((item) => item.status === "I").length;
    const sakit = data.filter((item) => item.status === "S").length;
    const alpa = data.filter((item) => item.status === "A").length;

    const totalDiisi = hadir + izin + sakit + alpa;
    const persentase = totalDiisi > 0 ? Number(((hadir / totalDiisi) * 100).toFixed(2)) : 0;

    return { hadir, izin, sakit, alpa, persentase };
  };

  // ================= STATISTIK RINGKASAN =================
  const ringkasan = useMemo(() => {
    if (siswa.length === 0) {
      return { totalSiswa: 0, totalPertemuan: 0, rataRata: 0, perluPerhatian: 0 };
    }

    const rekapSemua = siswa.map((item) => getRekapSiswa(item.id));
    const rataRata = rekapSemua.reduce((sum, item) => sum + item.persentase, 0) / rekapSemua.length;
    const perluPerhatian = rekapSemua.filter(
      (item) => item.persentase < 75 && item.hadir + item.izin + item.sakit + item.alpa > 0,
    ).length;

    return {
      totalSiswa: siswa.length,
      totalPertemuan: pertemuan.length,
      rataRata: Number(rataRata.toFixed(1)),
      perluPerhatian,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswa, absensiData, pertemuan]);

  const filteredSiswa = useMemo(() => {
    if (!searchSiswa.trim()) return siswa;

    const keyword = searchSiswa.trim().toLowerCase();

    return siswa.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) || item.nis.toLowerCase().includes(keyword),
    );
  }, [siswa, searchSiswa]);

  // ================= AKSI PERTEMUAN =================
  const handleSimpanPertemuan = async () => {
    if (!kelasId || !mataPelajaranId || !semesterId) {
      toast.error("Data belum lengkap", {
        description: "Silakan pilih kelas, mata pelajaran, dan semester.",
      });
      return;
    }

    if (!tanggalPertemuan) {
      toast.error("Tanggal belum dipilih", {
        description: "Silakan pilih tanggal pertemuan.",
      });
      return;
    }

    try {
      if (editPertemuanId !== null) {
        const response = await fetch(`${API_URL}/absensi/pertemuan/${editPertemuanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tanggal: tanggalPertemuan }),
        });

        if (!response.ok) throw new Error("Gagal memperbarui tanggal.");

        const updated = await response.json();

        setPertemuan((prev) =>
          prev.map((item) =>
            item.id === editPertemuanId ? { ...item, tanggal: updated.tanggal } : item,
          ),
        );

        toast.success("Tanggal berhasil diperbarui", {
          description: `Pertemuan ${updated.pertemuanKe} telah diperbarui.`,
        });
      } else {
        if (pertemuan.length >= TOTAL_PERTEMUAN_MAX) {
          toast.error(`Maksimal ${TOTAL_PERTEMUAN_MAX} pertemuan`, {
            description: "Tidak dapat menambahkan pertemuan lagi.",
          });
          return;
        }

        const nomorPertemuan =
          pertemuan.length === 0 ? 1 : Math.max(...pertemuan.map((item) => item.pertemuanKe)) + 1;

        const response = await fetch(`${API_URL}/absensi/pertemuan`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kelasId: Number(kelasId),
            mataPelajaranId: Number(mataPelajaranId),
            semesterId: Number(semesterId),
            pertemuanKe: nomorPertemuan,
            tanggal: tanggalPertemuan,
          }),
        });

        if (!response.ok) throw new Error("Gagal membuat pertemuan.");

        const data = await response.json();

        setPertemuan((prev) => [...prev, data].sort((a, b) => a.pertemuanKe - b.pertemuanKe));

        toast.success("Pertemuan berhasil ditambahkan", {
          description: `Pertemuan ${nomorPertemuan} berhasil dibuat.`,
        });
      }

      setTanggalPertemuan("");
      setEditPertemuanId(null);
      setShowPertemuanModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan", {
        description: error instanceof Error ? error.message : "Gagal menyimpan data pertemuan.",
      });
    }
  };

  const handleEditPertemuan = (item: Pertemuan) => {
    const tanggal = new Date(item.tanggal);
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
    const hari = String(tanggal.getDate()).padStart(2, "0");

    setTanggalPertemuan(`${tahun}-${bulan}-${hari}`);
    setEditPertemuanId(item.id);
    setShowPertemuanModal(true);
  };

  // ================= AKSI STATUS ABSENSI =================
  const openStatusPopover = (
    event: MouseEvent<HTMLTableCellElement>,
    siswaId: number,
    pertemuanKe: number,
  ) => {
    const p = getPertemuanByKe(pertemuanKe);

    if (!p) {
      toast.info(`Pertemuan ke-${pertemuanKe} belum dibuat`, {
        description: "Tambahkan pertemuan terlebih dahulu sebelum mengisi kehadiran.",
      });
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const approxPopoverWidth = 230;
    const clampedLeft = Math.min(rect.left, window.innerWidth - approxPopoverWidth - 8);

    setActiveCell({
      siswaId,
      pertemuanKe,
      pertemuanId: p.id,
      top: rect.bottom + 6,
      left: Math.max(8, clampedLeft),
    });
  };

  const handleSetStatus = async (
    siswaId: number,
    pertemuanId: number,
    status: StatusKehadiran | null,
  ) => {
    try {
      const response = await fetch(`${API_URL}/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ absensiPertemuanId: pertemuanId, siswaId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error);
        toast.error("Gagal menyimpan absensi");
        return;
      }

      const saved = await response.json();

      setAbsensiData((prev) => {
        const existing = prev.find(
          (item) => item.siswaId === siswaId && item.absensiPertemuanId === pertemuanId,
        );

        if (existing) {
          return prev.map((item) =>
            item.id === existing.id ? { ...item, status: saved.status } : item,
          );
        }

        return [...prev, saved];
      });
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan absensi");
    } finally {
      setActiveCell(null);
    }
  };

  // Tutup popover saat scroll / resize / tekan Escape.
  useEffect(() => {
    if (!activeCell) return;

    const close = () => setActiveCell(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCell(null);
    };

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCell]);

  // ================= CETAK =================
  const selectedKelas = kelas.find((item) => String(item.id) === kelasId);
  const selectedMataPelajaran = mataPelajaran.find((item) => String(item.id) === mataPelajaranId);
  const selectedSemester = semester.find((item) => String(item.id) === semesterId);

  const handlePrint = () => {
    if (!isFilterComplete) {
      toast.error("Data belum lengkap", {
        description: "Pilih kelas, mata pelajaran, dan semester terlebih dahulu.",
      });
      return;
    }

    window.print();
  };

  // ================= RENDER =================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Absensi Siswa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola kehadiran siswa berdasarkan kelas, mata pelajaran, dan semester.
        </p>
      </div>

      {/* Filter */}
      <div className="no-print rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Kelas</label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              disabled={isLoadingMaster}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">{isLoadingMaster ? "Memuat..." : "Pilih Kelas"}</option>
              {kelas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode} - {item.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mata Pelajaran</label>
            <select
              value={mataPelajaranId}
              onChange={(e) => setMataPelajaranId(e.target.value)}
              disabled={isLoadingMaster}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">{isLoadingMaster ? "Memuat..." : "Pilih Mata Pelajaran"}</option>
              {mataPelajaran.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode} - {item.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Semester</label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              disabled={isLoadingMaster}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">{isLoadingMaster ? "Memuat..." : "Pilih Semester"}</option>
              {semester.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tahunAjaran} - {item.semester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nama Guru</label>
            <input
              type="text"
              value={namaGuru}
              onChange={(e) => setNamaGuru(e.target.value)}
              placeholder="Nama guru pengampu"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Statistik ringkas */}
      {isFilterComplete && siswa.length > 0 && (
        <div className="no-print grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon="👥" label="Total Siswa" value={String(ringkasan.totalSiswa)} accent="border-indigo-100" />
          <StatCard
            icon="📅"
            label="Pertemuan Terisi"
            value={`${ringkasan.totalPertemuan}/${TOTAL_PERTEMUAN_MAX}`}
            accent="border-sky-100"
          />
          <StatCard icon="📊" label="Rata-rata Hadir" value={`${ringkasan.rataRata}%`} accent="border-emerald-100" />
          <StatCard icon="⚠️" label="Perlu Perhatian" value={String(ringkasan.perluPerhatian)} accent="border-amber-100" />
        </div>
      )}

      {/* Konten utama */}
      {!isFilterComplete ? (
        <EmptyState
          icon="🗂️"
          title="Pilih kelas, mata pelajaran, dan semester"
          description="Lengkapi ketiga filter di atas untuk mulai mengelola data absensi."
        />
      ) : isLoadingSiswa || isLoadingAbsensi ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-sm text-gray-500 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Memuat data absensi...
        </div>
      ) : siswa.length === 0 ? (
        <EmptyState icon="🧑‍🎓" title="Belum ada siswa" description="Tidak ditemukan siswa pada kelas yang dipilih." />
      ) : (
        <div className="print-report rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header khusus cetak */}
          <div className="print-header hidden px-2 pt-2">
            <h1>Kehadiran Siswa</h1>
            <div className="print-meta">
              <div className="print-meta-col">
                <p>Kelas : {selectedKelas ? `${selectedKelas.kode} - ${selectedKelas.nama}` : "-"}</p>
                <p>
                  Tahun / Semester :{" "}
                  {selectedSemester ? `${selectedSemester.tahunAjaran} - ${selectedSemester.semester}` : "-"}
                </p>
              </div>
              <div className="print-meta-col">
                <p>Nama Guru : {namaGuru || "-"}</p>
                <p>Mata Pelajaran : {selectedMataPelajaran?.nama ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="no-print flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Rekap Absensi Siswa</h2>
              <p className="mt-1 text-xs text-gray-500">Klik sel pertemuan untuk mengisi status kehadiran.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                placeholder="Cari nama / NIS..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 sm:w-48"
              />

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                🖨️ Cetak / PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditPertemuanId(null);
                  setTanggalPertemuan("");
                  setShowPertemuanModal(true);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                + Tambah Pertemuan
              </button>
            </div>
          </div>

          {/* Legenda */}
          <div className="no-print flex flex-wrap gap-4 border-b border-gray-100 px-4 py-2.5 text-xs text-gray-600">
            {(Object.keys(STATUS_CONFIG) as StatusKehadiran[]).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[key].dot}`} />
                {key} - {STATUS_CONFIG[key].label}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-max border-collapse text-sm">
              <colgroup>
                <col className="print-col-no" />
                <col className="print-col-name" />
                <col className="print-col-jk" />
                {Array.from({ length: TOTAL_PERTEMUAN_MAX }, (_, index) => (
                  <col key={`col-meeting-${index}`} className="print-col-meeting" />
                ))}
                <col className="print-col-total" />
                <col className="print-col-total" />
                <col className="print-col-total" />
                <col className="print-col-total" />
                <col className="print-col-percent" />
              </colgroup>

              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan={2} className="sticky left-0 z-20 border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-[48px] z-20 min-w-[220px] border border-gray-200 bg-gray-50 px-4 py-3 text-left"
                  >
                    Nama
                  </th>
                  <th rowSpan={2} className="border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                    JK
                  </th>
                  <th colSpan={TOTAL_PERTEMUAN_MAX} className="border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                    Pertemuan Ke -
                  </th>
                  <th colSpan={4} className="border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                    Total
                  </th>
                  <th rowSpan={2} className="min-w-[110px] border border-gray-200 bg-gray-50 px-3 py-3 text-center">
                    Hadir %
                  </th>
                </tr>

                <tr className="bg-gray-50">
                  {Array.from({ length: TOTAL_PERTEMUAN_MAX }, (_, index) => {
                    const nomor = index + 1;
                    const dataPertemuan = getPertemuanByKe(nomor);
                    const tanggal = dataPertemuan
                      ? new Date(dataPertemuan.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : null;

                    return (
                      <th key={nomor} className="min-w-[65px] border border-gray-200 px-2 py-2 text-center">
                        <div className="font-semibold">{nomor}</div>
                        <div
                          onClick={() => dataPertemuan && handleEditPertemuan(dataPertemuan)}
                          className={`mt-1 text-[10px] font-normal ${
                            dataPertemuan ? "cursor-pointer text-indigo-600 hover:underline" : "text-gray-300"
                          }`}
                          title={dataPertemuan ? "Klik untuk mengubah tanggal" : "Pertemuan belum dibuat"}
                        >
                          {tanggal ?? "-"}
                        </div>
                      </th>
                    );
                  })}

                  <th className="min-w-[55px] border border-gray-200 px-3 py-3 text-center text-green-600">H</th>
                  <th className="min-w-[55px] border border-gray-200 px-3 py-3 text-center text-yellow-600">I</th>
                  <th className="min-w-[55px] border border-gray-200 px-3 py-3 text-center text-blue-600">S</th>
                  <th className="min-w-[55px] border border-gray-200 px-3 py-3 text-center text-red-600">A</th>
                </tr>
              </thead>

              <tbody>
                {filteredSiswa.map((item, index) => {
                  const rekap = getRekapSiswa(item.id);
                  const barColor =
                    rekap.persentase >= 90
                      ? "bg-green-500"
                      : rekap.persentase >= 75
                        ? "bg-yellow-500"
                        : "bg-red-500";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 ${
                        rekap.persentase < 75 && rekap.persentase > 0 ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="sticky left-0 z-10 border border-gray-200 bg-white px-4 py-3 text-center">
                        {index + 1}
                      </td>
                      <td className="sticky left-[48px] z-10 border border-gray-200 bg-white px-4 py-3 font-medium">
                        {item.nama}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{item.jk}</td>

                      {Array.from({ length: TOTAL_PERTEMUAN_MAX }, (_, meeting) => {
                        const pertemuanKe = meeting + 1;
                        const status = getStatus(item.id, pertemuanKe);
                        const exists = Boolean(getPertemuanByKe(pertemuanKe));

                        return (
                          <td
                            key={pertemuanKe}
                            onClick={(e) => openStatusPopover(e, item.id, pertemuanKe)}
                            title={
                              status
                                ? STATUS_CONFIG[status].label
                                : exists
                                  ? "Klik untuk mengisi"
                                  : "Pertemuan belum dibuat"
                            }
                            className={`h-12 min-w-[55px] border border-gray-200 text-center font-semibold transition ${
                              exists ? "cursor-pointer hover:bg-indigo-50" : "cursor-not-allowed bg-gray-50/60"
                            } ${status ? STATUS_CONFIG[status].text : "text-gray-300"}`}
                          >
                            {status ?? (exists ? "·" : "—")}
                          </td>
                        );
                      })}

                      <td className="border border-gray-200 px-3 py-3 text-center font-semibold text-green-600">
                        {rekap.hadir}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center font-semibold text-yellow-600">
                        {rekap.izin}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center font-semibold text-blue-600">
                        {rekap.sakit}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center font-semibold text-red-600">
                        {rekap.alpa}
                      </td>
                      <td className="border border-gray-200 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="attendance-bar h-2 w-full min-w-[50px] overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rekap.persentase}%` }} />
                          </div>
                          <span className="attendance-percent w-10 shrink-0 text-right text-xs font-semibold">
                            {rekap.persentase}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredSiswa.length === 0 && (
                  <tr>
                    <td colSpan={TOTAL_PERTEMUAN_MAX + 8} className="px-4 py-8 text-center text-sm text-gray-400">
                      Tidak ada siswa yang cocok dengan pencarian &quot;{searchSiswa}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal tambah/edit pertemuan */}
      {showPertemuanModal && (
        <div
          className="no-print animate-backdropIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() => {
            setShowPertemuanModal(false);
            setEditPertemuanId(null);
            setTanggalPertemuan("");
          }}
        >
          <div
            className="animate-modalIn w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editPertemuanId !== null ? "✏️ Edit Pertemuan" : "📅 Tambah Pertemuan"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editPertemuanId !== null
                  ? "Ubah tanggal pertemuan yang sudah dibuat."
                  : "Tentukan tanggal untuk pertemuan baru."}
              </p>
            </div>

            <div className="px-6 py-6">
              {editPertemuanId !== null && (
                <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                  Pertemuan{" "}
                  <span className="font-bold">
                    {pertemuan.find((item) => item.id === editPertemuanId)?.pertemuanKe}
                  </span>
                </div>
              )}

              <label className="mb-2 block text-sm font-medium text-gray-700">Tanggal Pertemuan</label>
              <input
                type="date"
                value={tanggalPertemuan}
                onChange={(e) => setTanggalPertemuan(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowPertemuanModal(false);
                  setEditPertemuanId(null);
                  setTanggalPertemuan("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSimpanPertemuan}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 hover:shadow-md"
              >
                {editPertemuanId !== null ? "Update Tanggal" : "Simpan Pertemuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop transparan untuk menutup popover status saat klik di luar */}
      {activeCell &&
        createPortal(
          <div className="fixed inset-0 z-50" onClick={() => setActiveCell(null)} />,
          document.body,
        )}

      {/* Popover pilih status */}
      {activeCell &&
        createPortal(
          <div
            className="animate-modalIn fixed z-[60] flex gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
            style={{ top: activeCell.top, left: activeCell.left }}
          >
            {(Object.keys(STATUS_CONFIG) as StatusKehadiran[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSetStatus(activeCell.siswaId, activeCell.pertemuanId, key)}
                title={STATUS_CONFIG[key].label}
                className={`h-9 w-9 rounded-lg border text-sm font-bold transition ${STATUS_CONFIG[key].badge}`}
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleSetStatus(activeCell.siswaId, activeCell.pertemuanId, null)}
              title="Hapus status"
              className="h-9 w-9 rounded-lg border border-gray-200 text-sm font-bold text-gray-400 transition hover:bg-gray-50"
            >
              ×
            </button>
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-modalIn { animation: modalIn 150ms ease-out; }
        .animate-backdropIn { animation: backdropIn 150ms ease-out; }

        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        @media print {
          * { box-sizing: border-box !important; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          body * { visibility: hidden; }

          .print-report, .print-report * { visibility: visible; }

          .print-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          .no-print { display: none !important; }

          .print-header {
            display: block !important;
            margin: 0 0 8mm 0 !important;
          }

          .print-header h1 {
            margin: 0 0 5mm 0 !important;
            text-align: center !important;
            text-transform: uppercase !important;
            font-family: "Times New Roman", serif !important;
            font-size: 14pt !important;
            font-weight: bold !important;
          }

          .print-meta {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            column-gap: 10mm !important;
            width: 100% !important;
            margin-bottom: 4mm !important;
            font-family: "Times New Roman", serif !important;
            font-size: 9pt !important;
            line-height: 1.8 !important;
          }

          .print-meta-col p {
            margin: 0 !important;
          }

          .attendance-bar {
            display: none !important;
          }

          .attendance-percent {
            width: 100% !important;
            text-align: center !important;
          }

          .print-report .overflow-x-auto {
            overflow: visible !important;
            width: 100% !important;
          }

          .print-report table {
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            font-family: "Times New Roman", serif !important;
            font-size: 7pt !important;
          }

          .print-report th, .print-report td {
            border: 1px solid #000 !important;
            padding: 2px 1px !important;
            margin: 0 !important;
            min-width: 0 !important;
            height: auto !important;
            line-height: 1.15 !important;
            color: #000 !important;
            background: #fff !important;
            text-align: center !important;
            vertical-align: middle !important;
            white-space: nowrap !important;
            overflow: hidden !important;
          }

          .print-col-no { width: 6mm !important; }
          .print-col-name { width: 38mm !important; }
          .print-col-jk { width: 7mm !important; }
          .print-col-meeting { width: 5mm !important; }
          .print-col-total { width: 7mm !important; }
          .print-col-percent { width: 17mm !important; }

          .print-report thead th { font-weight: bold !important; }

          .print-report thead tr:nth-child(2) th {
            font-size: 6pt !important;
            padding: 2px 1px !important;
          }

          .print-report thead tr:nth-child(2) th div:first-child {
            font-size: 7pt !important;
            font-weight: bold !important;
          }

          .print-report thead tr:nth-child(2) th div:last-child {
            font-size: 5pt !important;
            line-height: 1 !important;
          }

          .print-report .sticky {
            position: static !important;
            left: auto !important;
            z-index: auto !important;
          }

          .print-report tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${accent}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
      <span className="text-4xl">{icon}</span>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="max-w-sm text-sm text-gray-400">{description}</p>
    </div>
  );
}
