import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const adminMenuItems = [
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
      {
        name: "Penilaian Essay",
        path: "/penilaian",
        icon: "✓",
      },
    ],
  },
  {
    title: "LAPORAN",
    items: [
      {
        name: "Hasil Ulangan",
        path: "/hasil",
        icon: "▥",
      },
    ],
  },
];

const siswaMenuItems = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: "▦",
      },
    ],
  },
  {
    title: "UJIAN",
    items: [
      {
        name: "Ujian Saya",
        path: "/ujian",
        icon: "📝",
      },
      {
        name: "Hasil Saya",
        path: "/hasil",
        icon: "▥",
      },
    ],
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const role = user?.role?.toUpperCase();

  const menuItems =
    role === "ADMIN"
      ? adminMenuItems
      : siswaMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast.success("Berhasil logout");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div
          className={`flex h-20 items-center border-b border-gray-200 ${
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5"
          }`}
        >
          {!collapsed ? (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                UJIAN
                <span className="text-indigo-600">
                  APP
                </span>
              </h1>

              <p className="text-xs text-gray-500">
                Sistem Ulangan Siswa
              </p>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-indigo-600">
              UA
            </h1>
          )}

          <button
            type="button"
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            title={
              collapsed
                ? "Buka sidebar"
                : "Tutup sidebar"
            }
          >
            ☰
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {menuItems.map((section) => (
            <div
              key={section.title}
              className="mb-6"
            >
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={
                      collapsed
                        ? item.name
                        : undefined
                    }
                    className={({ isActive }) =>
                      `flex items-center rounded-lg py-2.5 text-sm font-medium transition ${
                        collapsed
                          ? "justify-center px-2"
                          : "gap-3 px-3"
                      } ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <span className="flex w-5 justify-center text-base">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span>{item.name}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
            className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 ${
              collapsed
                ? "justify-center px-2"
                : "gap-3 px-3"
            }`}
          >
            <span>↪</span>

            {!collapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
}