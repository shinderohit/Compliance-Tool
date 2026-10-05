import Sidebar from "../components/Sidebar";
import logo from "../assets/Logo.png";
import { Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="app-shell text-[#18206F]">
      <Sidebar />

      <main className="main-panel overflow-y-auto">
        {location.pathname !== "/super-admin" && (
          <div className="mb-5 flex w-full justify-end">
            <img
              src={logo}
              alt="ViMATE logo"
              className="ml-auto h-12 w-auto object-contain"
            />
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
