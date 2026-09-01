import { LogOut } from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { roleMenus } from "../data/onboardingFlow";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const menuItems =
    role === "CLIENT" && user?.serviceModel !== "PAAS"
      ? roleMenus.CLIENT?.filter(
          ([name]) =>
            !["Onboarding Company/Branch", "Manage Companies"].includes(name),
        )
      : roleMenus[role];

  return (
    <aside className="sticky top-0 flex h-screen w-[290px] shrink-0 flex-col border-r border-[#D4AF37]/30 bg-white/90 p-5 shadow-[12px_0_35px_rgba(24,32,111,0.08)] backdrop-blur-xl">
      <div className="mb-7 rounded-[18px] border border-[#D4AF37]/30 bg-gradient-to-br from-[#18206F] via-[#1d2d89] to-[#27318c] p-3.5 text-white shadow-[0_12px_24px_rgba(24,32,111,0.18)]">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 text-[10px] font-black tracking-[0.16em] text-[#F8E7A3]">
            V
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              ViMATE
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F8E7A3]">
              Compliance
            </p>
          </div>
        </div>
      </div>

      <div className="sidebar-scrollbar-hidden flex-1 space-y-1.5 overflow-y-auto pr-1">
        {menuItems?.map(([name, path, Icon]) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={name}
              to={path}
              className={`
                flex items-center gap-3
                rounded-xl
                px-3.5 py-3
                text-sm
                font-semibold
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-[#18206F] text-white shadow-md shadow-[#18206F]/18"
                    : "text-[#18206F]/75 hover:bg-[#D4AF37]/12 hover:text-[#18206F]"
                }
              `}
            >
              <Icon size={18} />
              <span>{name}</span>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-3.5 py-3 text-sm font-bold text-[#18206F] shadow-[0_16px_24px_rgba(212,175,55,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c79d1e]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
