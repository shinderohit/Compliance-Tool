import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import UploadTrendChart from "../../components/charts/UploadTrendChart";
import DashboardAnalytics from "../../components/dashboard/DashboardAnalytics";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    client: null,
    stats: {
      totalCompanies: 0,
      totalUploads: 0,
      riskAlerts: 0,
    },
    companies: [],
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          API.get("/client/dashboard"),
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
          <h1 className="text-2xl font-bold">{dashboard.client?.name || ""}</h1>
          <p className="mt-2 text-[#18206F]/60 text-lg">
            Manage companies and compliance data.
          </p>
        </div>

        {/* Create Company moved to Super Admin — button removed for client users */}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <UploadTrendChart
          title="Companies"
          value={dashboard.stats.totalCompanies}
          total={Math.max(dashboard.stats.totalCompanies * 2, 100)}
          tone={0}
        />
        <UploadTrendChart
          title="Compliances"
          value={analytics?.totalCompliances ?? dashboard.stats.totalUploads}
          total={Math.max(
            (analytics?.totalCompliances ?? dashboard.stats.totalUploads) * 2,
            100,
          )}
          tone={1}
        />
        <UploadTrendChart
          title="No Risk"
          value={analytics?.lowRisk ?? 0}
          total={Math.max((analytics?.lowRisk ?? 0) * 2, 100)}
          tone={2}
        />
      </div>

      <DashboardAnalytics
        role="client"
        dashboard={dashboard}
        analytics={analytics || {}}
      />

      <div className="overflow-hidden rounded-lg border border-[#CBCBD4] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#18206F]/5 text-[#18206F]/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Company/Branch</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Uploads</th>
              <th className="px-4 py-3 font-semibold">URL</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  Loading company/branch...
                </td>
              </tr>
            ) : dashboard.companies.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  No companies found
                </td>
              </tr>
            ) : (
              dashboard.companies.map((company) => (
                <tr key={company.id} className="border-t border-[#CBCBD4]">
                  <td className="px-4 py-3 font-semibold">{company.name}</td>
                  <td className="px-4 py-3">{company.email}</td>
                  <td className="px-4 py-3">{company.totalUploads}</td>
                  <td className="px-4 py-3">
                    <a
                      href={company.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      {company.loginUrl}
                      <ExternalLink size={14} />
                    </a>
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
