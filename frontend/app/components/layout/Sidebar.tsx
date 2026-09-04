import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const adminMenuItems = [
  {
    title: "MAIN",
    items: [{ name: "Dashboard", path: "/dashboard", icon: "▦" }],
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
    items: [{ name: "Soal", path: "/soal", icon: "☷" }],
  },
  {
    title: "PENILAIAN ESSAY",
    items: [{ name: "Penilaian Essay", path: "/penilaian", icon: "✓" }],
  },
  {
    title: "LAPORAN",
    items: [{ name: "Hasil Ulangan", path: "/hasil", icon: "▥" }],
  },
];

const siswaMenuItems = [
  {
    title: "MAIN",
    items: [{ name: "Dashboard", path: "/dashboard", icon: "▦" }],
  },
  {
    title: "UJIAN",
    items: [
      { name: "Ujian Saya", path: "/ujian", icon: "📝" },
      { name: "Hasil Saya", path: "/hasil", icon: "▥" },
    ],
  },
];

// Pick the first item of each section (up to 4) for the mobile bottom bar —
// the rest, plus Logout, live behind "Menu". Works for admin or siswa.
function getPrimaryMobileItems(
  sections: { title: string; items: { name: string; path: string; icon: string }[] }[]
) {
  const primary: { name: string; path: string; icon: string }[] = [];
  for (const section of sections) {
    if (primary.length >= 4) break;
    primary.push(section.items[0]);
  }
  return primary;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [user] = useState(() => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const role = user?.role?.toUpperCase();
  const menuItems = role === "ADMIN" ? adminMenuItems : siswaMenuItems;
  const mobilePrimaryItems = getPrimaryMobileItems(menuItems);

  // Visual expansion on desktop: either pinned open (collapsed === false)
  // or temporarily opened because the cursor is hovering the rail.
  const expanded = !collapsed || hovered;

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast.success("Berhasil logout");

    setSheetOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* ---------- DESKTOP / WEB: pin toggle + hover-to-expand ---------- */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 md:flex ${
          expanded ? "w-64 shadow-xl shadow-gray-900/5" : "w-20"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-20 items-center border-b border-gray-200 ${
            expanded ? "justify-between px-5" : "justify-center px-3"
          }`}
        >
          {expanded ? (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-xl font-bold text-gray-900">
                UJIAN<span className="text-indigo-600">SMKBP</span>
              </h1>
              <p className="text-xs text-gray-500">Sistem Ulangan Siswa</p>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-indigo-600">UA</h1>
          )}

          {expanded && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              ☰
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          {menuItems.map((section) => (
            <div key={section.title} className="mb-6">
              <p
                className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-[11px] font-semibold tracking-wider text-gray-400 transition-all duration-200 ${
                  expanded ? "h-4 opacity-100" : "h-0 opacity-0"
                }`}
              >
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={!expanded ? item.name : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                        expanded ? "gap-3 px-3" : "justify-center px-2"
                      } ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                        )}
                        <span className="flex w-5 shrink-0 justify-center text-base transition-transform duration-150 group-active:scale-90">
                          {item.icon}
                        </span>
                        <span
                          className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                            expanded ? "max-w-[9rem] opacity-100" : "max-w-0 opacity-0"
                          }`}
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={!expanded ? "Logout" : undefined}
            className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 ${
              expanded ? "gap-3 px-3" : "justify-center px-2"
            }`}
          >
            <span className="w-5 shrink-0 text-center">↪</span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                expanded ? "max-w-[9rem] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Collapsed pin-toggle, shown as a floating tab so it's reachable
          even while the rail is narrow and not hovered. */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title="Buka sidebar"
          className="fixed left-20 top-6 z-40 hidden -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 shadow-md transition hover:text-gray-900 md:flex"
        >
          ☰
        </button>
      )}

      {/* ---------- MOBILE: app-style bottom bar ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {mobilePrimaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95 ${
                isActive ? "text-indigo-600" : "text-gray-500"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="truncate px-1">{item.name}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setSheetOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95 ${
            sheetOpen ? "text-indigo-600" : "text-gray-500"
          }`}
        >
          <span className="text-lg">{sheetOpen ? "✕" : "⋯"}</span>
          <span>Menu</span>
        </button>
      </nav>

      {/* ---------- MOBILE: full menu bottom sheet ---------- */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${sheetOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!sheetOpen}
      >
        <div
          onClick={() => setSheetOpen(false)}
          className={`absolute inset-0 bg-gray-900/40 transition-opacity duration-300 ${
            sheetOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex justify-center pb-2 pt-3">
            <span className="h-1.5 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center justify-between px-6 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                UJIAN<span className="text-indigo-600">APP</span>
              </h2>
              <p className="text-xs text-gray-500">Sistem Ulangan Siswa</p>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
            >
              ✕
            </button>
          </div>

          <div className="px-4">
            {menuItems.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSheetOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
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
          </div>

          <div className="border-t border-gray-200 px-4 pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
