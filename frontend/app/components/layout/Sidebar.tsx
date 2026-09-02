import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

const menuItems = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: "▦" },
    ],
  },
  {
    title: "MASTER DATA",
    items: [
      { name: "Kelas", path: "/kelas", icon: "▤" },
      { name: "Siswa", path: "/siswa", icon: "♙" },
      { name: "Ulangan", path: "/ulangan", icon: "▣" },
    ],
  },
  {
    title: "BANK SOAL",
    items: [
      { name: "Soal", path: "/soal", icon: "☷" },
    ],
  },
  {
    title: "PENILAIAN ESSAY",
    items: [
      { name: "Penilaian Essay", path: "/penilaian", icon: "✓" },
    ],
  },
  {
    title: "LAPORAN",
    items: [
      { name: "Hasil Ulangan", path: "/hasil", icon: "▥" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast.success("Berhasil logout");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-gray-200 px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              UJIAN<span className="text-indigo-600">APP</span>
            </h1>

            <p className="text-xs text-gray-500">
              Sistem Ulangan Siswa
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {menuItems.map((section) => (
            <div
              key={section.title}
              className="mb-6"
            >
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <span className="flex w-5 justify-center text-base">
                      {item.icon}
                    </span>

                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span>↪</span>
            Logout
          </button>
        </div>

      </div>
    </aside>
  );
}