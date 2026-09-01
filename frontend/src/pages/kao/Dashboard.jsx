import { ExternalLink, Plus } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import UploadTrendChart from "../../components/charts/UploadTrendChart";
import DashboardAnalytics from "../../components/dashboard/DashboardAnalytics";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    kao: null,
    stats: {
      totalClients: 0,
      totalCompanies: 0,
      totalUploads: 0,
    },
    clients: [],
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          API.get("/kao/dashboard"),
          API.get("/compliance/analytics"),
        ]);

        setDashboard(dashboardRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {dashboard.kao?.name ? `  ${dashboard.kao.name}` : ""}
          </h1>
          <p className="mt-2 text-[#18206F]/60 text-lg">
            Manage clients and tenant login access.
          </p>
        </div>

        <button
          onClick={() => navigate("/kao/create-client")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#18206F] text-white px-3 py-2 font-bold text-sm transition hover:bg-[#18206F]/85"
        >
          <Plus size={18} />
          Onboarding Client
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <UploadTrendChart
          title="Clients"
          value={dashboard.stats.totalClients}
          total={Math.max(dashboard.stats.totalClients * 2, 100)}
          tone={0}
        />
        <UploadTrendChart
          title="Companies"
          value={dashboard.stats.totalCompanies}
          total={Math.max(dashboard.stats.totalCompanies * 2, 100)}
          tone={1}
        />
        <UploadTrendChart
          title="Compliances"
          value={analytics?.totalCompliances ?? dashboard.stats.totalUploads}
          total={Math.max(
            (analytics?.totalCompliances ?? dashboard.stats.totalUploads) * 2,
            100,
          )}
          tone={2}
        />
      </div>

      <DashboardAnalytics
        role="kao"
        dashboard={dashboard}
        analytics={analytics || {}}
      />

      <div className="overflow-hidden rounded-lg border border-[#CBCBD4] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#18206F]/5 text-[#18206F]/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Companies</th>
              <th className="px-4 py-3 font-semibold">URL</th>
              <th className="px-4 py-3 font-semibold">Manage</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  Loading clients...
                </td>
              </tr>
            ) : dashboard.clients.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  No clients found
                </td>
              </tr>
            ) : (
              dashboard.clients.map((client) => (
                <tr key={client.id} className="border-t border-[#CBCBD4]">
                  <td className="px-4 py-3 font-semibold">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.totalCompanies}</td>
                  <td className="px-4 py-3">
                    <a
                      href={client.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      {client.loginUrl}
                      <ExternalLink size={14} />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate("/kao/manage-clients")}
                      title="Manage client"
                      aria-label="Manage client"
                      className="inline-flex items-center justify-center rounded-lg border border-[#CBCBD4] px-3 py-2 text-[#18206F]/70 hover:bg-[#18206F]/5"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
