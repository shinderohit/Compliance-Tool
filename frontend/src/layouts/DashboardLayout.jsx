import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="app-shell text-[#18206F]">
      <Sidebar />

      <main className="main-panel overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
