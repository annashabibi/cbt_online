import {
  type RouteConfig,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/layout/MainLayout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("kelas", "routes/kelas.tsx"),
    route("siswa", "routes/siswa.tsx"),
    route("ulangan", "routes/ulangan.tsx"),
    route("soal", "routes/soal.tsx"),
    route("penilaian", "routes/penilaian.tsx"),
    route("hasil", "routes/hasil.tsx"),
    route("absensi", "routes/absensi.tsx"),
route("modul-ajar", "routes/modul-ajar.tsx"),
route("modul-ajar/tambah", "routes/modul-ajar-tambah.tsx"),
route("modul-ajar/:id/edit", "routes/modul-ajar-edit.tsx"),
route("modul-ajar/:id", "routes/modul-ajar-detail.tsx"),
route("modul-ajar/:id/print", "routes/modul-ajar-print.tsx"),
    route("ujian", "routes/ujian.tsx"),
route("ujian/:id", "routes/kerjakan-ujian.tsx"),
  ]),

  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
] satisfies RouteConfig;