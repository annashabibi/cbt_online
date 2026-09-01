import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      <div className="ml-64">

        <Header />

        <main className="p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}