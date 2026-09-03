import { useState } from "react";

export default function Header() {
  const [user] = useState(() => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const nama =
    user?.siswa?.nama ||
    user?.username ||
    "User";

  const role =
    user?.role?.toUpperCase() === "ADMIN"
      ? "Administrator"
      : "Siswa";

  const kelas =
    user?.siswa?.kelas?.nama || "";

  const initials = nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">

      {/* =========================
          LEFT
      ========================= */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
          Sistem Ulangan Siswa
        </h2>

        <p className="mt-0.5 hidden truncate text-sm text-gray-500 sm:block">
          {role === "Administrator"
            ? "Kelola data dan hasil ulangan siswa"
            : "Kerjakan ulangan dan lihat hasil ujian"}
        </p>
      </div>

      {/* =========================
          RIGHT
      ========================= */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* NOTIFICATION */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 sm:h-10 sm:w-10"
        >
          <span className="text-lg sm:text-xl">
            ♢
          </span>

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 sm:right-2 sm:top-2" />
        </button>

        {/* DIVIDER */}
        <div className="h-8 w-px bg-gray-200" />

        {/* USER */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          {/* AVATAR */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 sm:h-10 sm:w-10 sm:text-base">
            {initials || "U"}
          </div>

          {/* USER INFO */}
          <div className="min-w-0 max-w-[140px] sm:max-w-[220px]">
            <p className="truncate text-sm font-semibold text-gray-800">
              {nama}
            </p>

            <p className="truncate text-xs text-gray-500">
              {role}

              {role === "Siswa" && kelas && (
                <>
                  {" • "}
                  {kelas}
                </>
              )}

              {role === "Administrator" && kelas && (
                <>
                  {" • "}
                  {kelas}
                </>
              )}
            </p>
          </div>

        </div>
      </div>

    </header>
  );
}