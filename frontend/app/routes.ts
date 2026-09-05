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
    route("ujian", "routes/ujian.tsx"),
route("ujian/:id", "routes/kerjakan-ujian.tsx"),
  ]),

  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
] satisfies RouteConfig;