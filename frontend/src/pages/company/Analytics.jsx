import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "../../api/axios";
import AnalyticsCard from "../../components/cards/AnalyticsCard";

const RISK_COLORS = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#16a34a",
};

const STATUS_COLORS = {
  Pending: "#d97706",
  Overdue: "#dc2626",
  Completed: "#16a34a",
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/compliance/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics API error:", err);
        const apiMessage =
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Failed to load analytics.";
        setError(
          `Failed to load analytics${err.response?.status ? ` (${err.response.status})` : ""}: ${apiMessage}`,
        );

        // store a structured debug object for display
        setDebugError(
          err.__debug || {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
            url: err.config?.url,
          },
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const riskData = analytics
    ? [
        { name: "High", value: analytics.highRisk || 0 },
        { name: "Medium", value: analytics.mediumRisk || 0 },
        { name: "Low", value: analytics.lowRisk || 0 },
      ].filter((item) => item.value > 0)
    : [];

  const statusData = (analytics?.statusDistribution || []).filter(
    (item) => item.value > 0,
  );

  const hasData =
    (analytics?.totalCompliances || 0) > 0 ||
    (analytics?.totalUploads || 0) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Compliance Analytics</h1>
        <p className="text-[#18206F]/60 mt-2">
          Status, risk, score, monthly activity, and department performance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {debugError && (
        <div className="mt-2 rounded-lg border border-[#CBCBD4] bg-[#F8FAFC] p-3 text-xs text-[#18206F]">
          <div className="font-semibold mb-1">Debug: API error details</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugError, null, 2)}
          </pre>
        </div>
      )}

      {loading ? (
        <div className="text-[#18206F]/60">Loading analytics...</div>
      ) : !analytics || !hasData ? (
        <div className="bg-white border border-[#CBCBD4] rounded-xl p-8 text-center text-[#18206F]/60">
          No compliance records available yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            <AnalyticsCard
              title="Total Compliance"
              value={analytics.totalCompliances || 0}
            />
            <AnalyticsCard title="Pending" value={analytics.pending || 0} />
            <AnalyticsCard title="Overdue" value={analytics.overdue || 0} />
            <AnalyticsCard title="Completed" value={analytics.completed || 0} />
            <AnalyticsCard
              title="Average AI Score"
              value={`${analytics.averageScore || 0}%`}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white border border-[#CBCBD4] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Status Distribution</h2>
              {statusData.length === 0 ? (
                <p className="text-[#18206F]/60">No status data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-[#CBCBD4] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Risk Distribution</h2>
              {riskData.length === 0 ? (
                <p className="text-[#18206F]/60">No risk data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#CBCBD4] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Compliance Records and Average Score
            </h2>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={analytics.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBCBD4" />
                <XAxis dataKey="month" stroke="#18206F" />
                <YAxis stroke="#18206F" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="uploads"
                  name="Records Added"
                  fill="#18206F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="averageScore"
                  name="Average Score"
                  fill="#D4AF37"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-[#CBCBD4] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Department-wise Report</h2>

            {(analytics.departmentWise || []).length === 0 ? (
              <p className="text-[#18206F]/60">
                Add departments to compliance records to see this report.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={analytics.departmentWise}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBCBD4" />
                    <XAxis dataKey="department" stroke="#18206F" />
                    <YAxis allowDecimals={false} stroke="#18206F" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      name="Pending"
                      stroke="#d97706"
                      fill="#d97706"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#18206F]/5">
                      <tr>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">Total</th>
                        <th className="p-3 text-left">Pending</th>
                        <th className="p-3 text-left">Overdue</th>
                        <th className="p-3 text-left">Completed</th>
                        <th className="p-3 text-left">High Risk</th>
                        <th className="p-3 text-left">Medium Risk</th>
                        <th className="p-3 text-left">Low Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.departmentWise.map((row) => (
                        <tr
                          key={row.department}
                          className="border-t border-[#CBCBD4]"
                        >
                          <td className="p-3 font-semibold">
                            {row.department}
                          </td>
                          <td className="p-3">{row.total}</td>
                          <td className="p-3">{row.pending}</td>
                          <td className="p-3">{row.overdue}</td>
                          <td className="p-3">{row.completed}</td>
                          <td className="p-3">{row.highRisk}</td>
                          <td className="p-3">{row.mediumRisk}</td>
                          <td className="p-3">{row.lowRisk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
