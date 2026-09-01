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
            ![
              "Onboarding Company/Branch",
              "Manage Companies",
            ].includes(name),
        )
      : roleMenus[role];

  return (
    <aside className="w-65 bg-white border-r border-[#D4AF37] shadow-lg p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#18206F]">ViMATE</h1>

        <p className="text-[#D4AF37] font-semibold">Compliance Platform</p>
      </div>

      <div className="flex-1 space-y-2">
        {menuItems?.map(([name, path, Icon]) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={name}
              to={path}
              className={`
              flex items-center gap-3
              px-2 py-1
              rounded-xl
              text-sm
              transition-all
              duration-300
              ${
                isActive
                  ? "bg-[#18206F] text-white"
                  : "text-[#18206F] hover:bg-[#D4AF37] hover:text-[#18206F]"
              }
            `}
            >
              <Icon size={18} />
              {name}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="
        flex items-center
        justify-center
        gap-2
        mt-6
        px-2 py-1
        w-full
        rounded-xl
        bg-[#D4AF37]
        text-[#18206F]
        text-sm
        font-bold
        hover:bg-[#c49e25]
        transition
      "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
