import { LogOut } from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "../assets/Logo.png";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { roleMenus } from "../data/onboardingFlow";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [organizationLogo, setOrganizationLogo] = useState(user?.logo || null);

  const role = user?.role;
  useEffect(() => {
    if (role !== "CLIENT" && role !== "COMPANY") {
      setOrganizationLogo(null);
      return undefined;
    }

    let active = true;
    const endpoint =
      role === "CLIENT" ? "/client/dashboard" : "/company/dashboard";

    API.get(endpoint)
      .then(({ data }) => {
        if (active) {
          setOrganizationLogo(data.client?.logo || data.company?.logo || null);
        }
      })
      .catch((error) => {
        console.error("Failed to load organization logo", error);
      });

    return () => {
      active = false;
    };
  }, [role, user?.id]);

  const menuItems =
    role === "CLIENT" && user?.serviceModel !== "PAAS"
      ? roleMenus.CLIENT?.filter(
          ([name]) =>
            !["Onboarding Company/Branch", "Manage Companies"].includes(name),
        )
      : roleMenus[role];
  const logoPath = organizationLogo?.fileUrl || organizationLogo;
  let sidebarLogo = logo;

  if (logoPath) {
    try {
      const apiOrigin = new URL(API.defaults.baseURL).origin;
      sidebarLogo = new URL(logoPath, `${apiOrigin}/`).href;
    } catch {
      sidebarLogo = logo;
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[290px] shrink-0 flex-col border-r border-[#D4AF37]/30 bg-white/90 p-5 shadow-[12px_0_35px_rgba(24,32,111,0.08)] backdrop-blur-xl">
      <div className="mb-1 flex items-center justify-center">
        <img
          src={sidebarLogo}
          alt="Organization logo"
          className="h-20 w-auto max-w-[180px] object-contain"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = logo;
          }}
        />
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
