import { Link, useNavigate } from "react-router-dom";
import { FaChartBar, FaUpload } from "react-icons/fa";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-72 bg-white border-r border-[#CBCBD4] p-5">
      <h1 className="text-2xl font-bold mb-10">Compliance SaaS</h1>

      <div className="space-y-3">
        {user?.role === "SUPER_ADMIN" && (
          <>
            <Link
              to="/super-admin"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Dashboard
            </Link>
            <Link
              to="/super-admin/create-kao"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Onboarding KAO
            </Link>
            <Link
              to="/super-admin/create-client"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Onboarding Client
            </Link>
            <Link
              to="/super-admin/create-company"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Onboarding Company/Branch
            </Link>
            <Link
              to="/super-admin/manage-kaos"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage KAOs
            </Link>
            <Link
              to="/super-admin/clients"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage Clients
            </Link>
            <Link
              to="/super-admin/companies"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage Companies
            </Link>
            <Link
              to="/super-admin/documents"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Documents
            </Link>

            <Link
              to="/super-admin/analytics"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Analytics
            </Link>

            <Link
              to="/super-admin/activity-logs"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Activity Logs
            </Link>

            <Link
              to="/super-admin/settings"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Settings
            </Link>
          </>
        )}

        {user?.role === "KAO" && (
          <>
            <Link
              to="/kao"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Dashboard
            </Link>
            <Link
              to="/kao/create-client"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Onboarding Client
            </Link>
            <Link
              to="/kao/manage-clients"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage Clients
            </Link>
            <Link
              to="/kao/manage-companies"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage Companies
            </Link>
            <Link
              to="/kao/compliance"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Compliance
            </Link>

            <Link
              to="/kao/documents"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Documents
            </Link>

            <Link
              to="/kao/reports"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Reports
            </Link>
            <Link
              to="/kao/analytics"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Analytics
            </Link>
            <Link
              to="/kao/activity-logs"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Activity Logs
            </Link>
          </>
        )}

        {user?.role === "CLIENT" && (
          <>
            <Link
              to="/client"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Dashboard
            </Link>
            <Link
              to="/client/manage-companies"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Manage Companies
            </Link>
            <Link
              to="/client/compliance"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Compliance
            </Link>

            <Link
              to="/client/uploads"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Uploads
            </Link>

            <Link
              to="/client/onboarding"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Onboarding
            </Link>

            <Link
              to="/client/analytics"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Analytics
            </Link>
          </>
        )}

        {user?.role === "COMPANY" && (
          <>
            <Link
              to="/company"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              <FaChartBar /> Dashboard
            </Link>
            <Link
              to="/company/add-compliance"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              <FaUpload /> Add Compliance
            </Link>
            <Link
              to="/company/upload-documents"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Upload Documents
            </Link>

            <Link
              to="/company/upload-history"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Upload History
            </Link>

            <Link
              to="/company/compliance"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Compliance
            </Link>

            <Link
              to="/company/reports"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#18206F]/5 hover:bg-[#D4AF37]/15"
            >
              Reports
            </Link>
          </>
        )}

        <button
          onClick={logout}
          className="w-full mt-10 bg-red-600 hover:bg-red-700 p-3 rounded-xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
