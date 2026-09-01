import UploadTrendChart from "../charts/UploadTrendChart";
import ClientGrowthChart from "../charts/ClientGrowthChart";
import CompanyGrowthChart from "../charts/CompanyGrowthChart";
import DepartmentPerformanceChart from "../charts/DepartmentPerformanceChart";
import MonthlyUploadChart from "../charts/MonthlyUploadChart";
import RiskDistributionChart from "../charts/RiskDistributionChart";
import ScoreTrendChart from "../charts/ScoreTrendChart";
import StateWiseChart from "../charts/StateWiseChart";
import StatusDistributionChart from "../charts/StatusDistributionChart";
import ComplianceTrendChart from "../charts/ComplianceTrendChart";

function toRiskData(analytics = {}) {
  return [
    { name: "Low", value: analytics.lowRisk || 0 },
    { name: "Medium", value: analytics.mediumRisk || 0 },
    { name: "High", value: analytics.highRisk || 0 },
  ];
}

function toStatusTrend(analytics = {}) {
  const monthlyTrend = analytics.monthlyTrend || [];

  if (
    monthlyTrend.some((item) => item.completed || item.pending || item.overdue)
  ) {
    return monthlyTrend;
  }

  return monthlyTrend.map((item) => ({
    ...item,
    completed: analytics.completed || 0,
    pending: analytics.pending || 0,
    overdue: analytics.overdue || 0,
  }));
}

function toStateWise(dashboard = {}, analytics = {}) {
  if (Array.isArray(analytics.stateWise)) return analytics.stateWise;

  const rows = [
    ...(dashboard.companies || []),
    ...(dashboard.tables?.companies || []),
  ];

  const byState = rows.reduce((acc, company) => {
    const state = company.state || company.location || "Unassigned";
    acc[state] ||= { state, completed: 0, pending: 0, overdue: 0 };
    acc[state].completed += company.completed || 0;
    acc[state].pending += company.pending || company.totalUploads || 0;
    acc[state].overdue += company.overdue || 0;
    return acc;
  }, {});

  return Object.values(byState);
}

function toLawAreaData(analytics = {}) {
  const lawAreaData = Array.isArray(analytics.lawAreaWise)
    ? analytics.lawAreaWise
    : [];

  if (lawAreaData.length > 0) {
    return lawAreaData.map((item) => ({
      area:
        item.area ||
        item.lawArea ||
        item.department ||
        item.name ||
        "Unassigned",
      completed: Number(item.completed) || 0,
      pending: Number(item.pending) || 0,
    }));
  }

  return (analytics.departmentWise || []).map((item) => ({
    area: item.department || item.area || item.name || "Unassigned",
    completed: Number(item.completed) || 0,
    pending: Number(item.pending) || 0,
  }));
}

function toCompanyProgress(dashboard = {}, analytics = {}) {
  if (Array.isArray(analytics.companyProgress))
    return analytics.companyProgress;
  if (Array.isArray(dashboard.charts?.companyGrowth)) {
    return dashboard.charts.companyGrowth;
  }

  return (analytics.monthlyTrend || []).map((item) => ({
    month: item.month,
    companies: item.averageScore || item.uploads || 0,
  }));
}

function toComplianceTrend(dashboard = {}, analytics = {}) {
  const trend = Array.isArray(analytics.monthlyTrend)
    ? analytics.monthlyTrend
    : Array.isArray(analytics.monthlyUploads)
      ? analytics.monthlyUploads
      : Array.isArray(dashboard.charts?.monthlyUploads)
        ? dashboard.charts.monthlyUploads
        : [];

  return (trend || []).map((item, index) => ({
    month: item.month || item.label || item.name || `M${index + 1}`,
    uploads:
      Number(
        item.uploads ?? item.count ?? item.total ?? item.compliances ?? 0,
      ) || 0,
    averageScore:
      Number(item.averageScore ?? item.score ?? item.value ?? 0) || 0,
    completed: Number(item.completed) || 0,
    pending: Number(item.pending) || 0,
    overdue: Number(item.overdue) || 0,
  }));
}

function computeTarget(value) {
  const v = Number(value) || 0;
  return Math.max(Math.ceil(v * 1.25), 100);
}

function resolveKpis(role, dashboard = {}, analytics = {}) {
  const total =
    analytics.totalCompliances ||
    dashboard.stats?.totalUploads ||
    dashboard.stats?.totalCompanies ||
    dashboard.stats?.totalClients ||
    dashboard.stats?.totalKAOs ||
    0;

  const completed = analytics.completed || 0;
  const pending = analytics.pending || dashboard.stats?.riskAlerts || 0;
  const overdue = analytics.overdue || 0;

  if (role === "admin") {
    const complianceCoverage =
      analytics.totalCompliances || dashboard.stats?.totalUploads || 0;
    const kaos = dashboard.stats?.totalKAOs || 0;
    const clients = dashboard.stats?.totalClients || 0;
    const companies = dashboard.stats?.totalCompanies || 0;

    return [
      { title: "KAOs", value: kaos, total: computeTarget(kaos) },
      { title: "Clients", value: clients, total: computeTarget(clients) },
      { title: "Companies", value: companies, total: computeTarget(companies) },
      {
        title: "Compliances",
        value: complianceCoverage,
        total: computeTarget(complianceCoverage),
      },
    ];
  }

  if (role === "company") {
    return [
      { title: "Total Compliance", value: total, total: computeTarget(total) },
      {
        title: "Completed Compliance",
        value: completed,
        total: computeTarget(total),
      },
      {
        title: "Pending Compliance",
        value: pending,
        total: computeTarget(total),
      },
      {
        title: "Overdue Compliance",
        value: overdue,
        total: computeTarget(total),
      },
    ];
  }

  if (role === "kao") {
    return [];
  }

  return [
    { title: "Completed", value: completed, total: computeTarget(total) },
    { title: "Pending", value: pending, total: computeTarget(total) },
    { title: "Overdue", value: overdue, total: computeTarget(total) },
  ];
}

export default function DashboardAnalytics({
  role = "company",
  dashboard = {},
  analytics = {},
}) {
  const monthlyTrend = toComplianceTrend(dashboard, analytics);
  const statusTrend = toStatusTrend(analytics);
  const departmentWise = analytics.departmentWise || [];
  const score = analytics.averageScore || dashboard.stats?.complianceScore || 0;
  const total =
    analytics.totalCompliances ||
    dashboard.stats?.totalUploads ||
    dashboard.stats?.totalCompanies ||
    dashboard.stats?.totalClients ||
    dashboard.stats?.totalKAOs ||
    0;

  return (
    <section className="space-y-6 rounded-[28px] p-4 md:p-1">
      {/* <div>
        <h2 className="text-2xl font-bold text-[#1F2559]">
          Compliance Analytics
        </h2>
        <p className="mt-1 text-sm text-[#8B91B2]">
          Enterprise dashboard view for counts, trends, status, risk, score, and
          operational progress.
        </p>
      </div> */}

      {role !== "kao" && role !== "client" && (
        <div
          className={`grid grid-cols-1 gap-4 ${
            role === "admin" || role === "company"
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-3"
          }`}
        >
          {resolveKpis(role, dashboard, analytics).map((item, index) => (
            <UploadTrendChart
              key={item.title}
              title={item.title}
              value={item.value}
              total={item.total || total}
              tone={index}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {role === "company" ? (
          <>
            <StateWiseChart data={toStateWise(dashboard, analytics)} />
            <RiskDistributionChart data={toRiskData(analytics)} />
            <ClientGrowthChart data={toLawAreaData(analytics)} />
            <ComplianceTrendChart data={monthlyTrend} />
          </>
        ) : role === "kao" ? (
          <>
            <ComplianceTrendChart data={monthlyTrend} />
            <RiskDistributionChart data={toRiskData(analytics)} />
            <ClientGrowthChart data={toLawAreaData(analytics)} />
            <StatusDistributionChart data={statusTrend} />
          </>
        ) : (
          <>
            <ComplianceTrendChart data={monthlyTrend} />
            <StatusDistributionChart data={statusTrend} />
            <ScoreTrendChart score={score} />
            <MonthlyUploadChart data={monthlyTrend} />
            {role !== "admin" && (
              <>
                <StateWiseChart data={toStateWise(dashboard, analytics)} />
                <RiskDistributionChart data={toRiskData(analytics)} />
                <CompanyGrowthChart
                  data={toCompanyProgress(dashboard, analytics)}
                />
                <DepartmentPerformanceChart data={departmentWise} />
                <ClientGrowthChart data={toLawAreaData(analytics)} />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
