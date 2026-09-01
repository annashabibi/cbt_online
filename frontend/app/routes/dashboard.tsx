const stats = [
  {
    title: "Total Siswa",
    value: "120",
    description: "+12 siswa bulan ini",
    icon: "👨‍🎓",
  },
  {
    title: "Total Ulangan",
    value: "15",
    description: "8 ulangan aktif",
    icon: "📝",
  },
  {
    title: "Total Soal",
    value: "350",
    description: "280 PG • 70 Essay",
    icon: "📚",
  },
  {
    title: "Hasil Ulangan",
    value: "450",
    description: "Data penilaian",
    icon: "📊",
  },
];

const exams = [
  {
    name: "Ulangan Matematika",
    className: "XII A",
    questions: 30,
    duration: "60 Menit",
    participants: 32,
    status: "Aktif",
  },
  {
    name: "Ulangan Bahasa Indonesia",
    className: "XII B",
    questions: 25,
    duration: "45 Menit",
    participants: 28,
    status: "Aktif",
  },
  {
    name: "Ulangan Pemrograman Web",
    className: "XI RPL",
    questions: 40,
    duration: "90 Menit",
    participants: 30,
    status: "Selesai",
  },
  {
    name: "Ulangan Basis Data",
    className: "XI RPL",
    questions: 35,
    duration: "60 Menit",
    participants: 29,
    status: "Draft",
  },
];

const activities = [
  {
    title: "Ulangan Matematika selesai",
    description: "32 siswa telah mengerjakan",
    time: "10 menit lalu",
    icon: "✓",
  },
  {
    title: "5 soal baru ditambahkan",
    description: "Bank soal Pemrograman Web",
    time: "30 menit lalu",
    icon: "+",
  },
  {
    title: "Siswa baru ditambahkan",
    description: "12 siswa kelas XII A",
    time: "1 jam lalu",
    icon: "👤",
  },
  {
    title: "Penilaian essay diperbarui",
    description: "Ulangan Bahasa Indonesia",
    time: "2 jam lalu",
    icon: "★",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Welcome */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Selamat Datang, Administrator 👋
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Berikut ringkasan aktivitas sistem ulangan siswa hari ini.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h2>

                <p className="mt-2 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl transition group-hover:bg-indigo-100">
                {stat.icon}
              </div>

            </div>
          </div>
        ))}

      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent Exams */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>
              <h2 className="font-semibold text-gray-900">
                Ulangan Terbaru
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Daftar ulangan yang tersedia
              </p>
            </div>

            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Lihat Semua →
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-left">

              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">

                <tr>
                  <th className="px-6 py-4">
                    Ulangan
                  </th>

                  <th className="px-4 py-4">
                    Kelas
                  </th>

                  <th className="px-4 py-4">
                    Soal
                  </th>

                  <th className="px-4 py-4">
                    Peserta
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {exams.map((exam) => (

                  <tr
                    key={exam.name}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {exam.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {exam.duration}
                        </p>
                      </div>

                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {exam.className}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {exam.questions}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {exam.participants}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          exam.status === "Aktif"
                            ? "bg-green-50 text-green-600"
                            : exam.status === "Selesai"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {exam.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <h2 className="font-semibold text-gray-900">
              Aktivitas Terbaru
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Aktivitas sistem terbaru
            </p>

          </div>

          <div className="divide-y divide-gray-100">

            {activities.map((activity) => (

              <div
                key={activity.title}
                className="flex gap-4 px-6 py-5"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                  {activity.icon}
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-800">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {activity.description}
                  </p>

                  <p className="mt-2 text-[11px] text-gray-400">
                    {activity.time}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* Bottom Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

          <p className="text-sm font-medium text-indigo-600">
            Rata-rata Nilai
          </p>

          <div className="mt-2 flex items-end gap-2">

            <span className="text-3xl font-bold text-indigo-900">
              82.4
            </span>

            <span className="mb-1 text-xs font-medium text-green-600">
              +4.2%
            </span>

          </div>

          <p className="mt-2 text-xs text-indigo-500">
            Dibandingkan bulan sebelumnya
          </p>

        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

          <p className="text-sm font-medium text-green-600">
            Tingkat Kelulusan
          </p>

          <div className="mt-2 flex items-end gap-2">

            <span className="text-3xl font-bold text-green-900">
              87%
            </span>

            <span className="mb-1 text-xs font-medium text-green-600">
              +6.8%
            </span>

          </div>

          <p className="mt-2 text-xs text-green-500">
            Dari seluruh hasil ulangan
          </p>

        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">

          <p className="text-sm font-medium text-orange-600">
            Essay Belum Dinilai
          </p>

          <div className="mt-2 flex items-end gap-2">

            <span className="text-3xl font-bold text-orange-900">
              18
            </span>

            <span className="mb-1 text-xs font-medium text-orange-600">
              Jawaban
            </span>

          </div>

          <p className="mt-2 text-xs text-orange-500">
            Menunggu penilaian guru
          </p>

        </div>

      </section>

    </div>
  );
}