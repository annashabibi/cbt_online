import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
export default function MainLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setCheckingAuth(false);
  }, [navigate]);
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Memeriksa autentikasi...
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className={`transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Header />
        <main className="p-4 pb-24 sm:p-6 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
