import { Building2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import logo from "../../assets/Logo.png";
import DashboardAnalytics from "../../components/dashboard/DashboardAnalytics";
import DataTable from "../../components/tables/DataTable";

const emptyDashboard = {
  stats: {
    totalKAOs: 0,
    totalClients: 0,
    totalCompanies: 0,
    totalUploads: 0,
  },
  charts: {
    monthlyUploads: [],
    clientGrowth: [],
    companyGrowth: [],
  },
  tables: {
    kaos: [],
    clients: [],
    companies: [],
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, analyticsRes, auditRes] = await Promise.all([
          API.get("/super-admin/dashboard"),
          API.get("/compliance/analytics"),
          API.get("/audit"),
        ]);

        setDashboard(dashboardRes.data || emptyDashboard);
        setAnalytics(analyticsRes.data);
        setAuditLogs(auditRes.data?.logs || []);
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            {/* <img
              src={logo}
              alt="ViMATE logo"
              className="h-10 w-auto object-contain"
            /> */}
          </div>
          <p className="mt-2 text-lg text-[#18206F]/60">
            Platform-wide tenant, client, company, and upload activity.
          </p>
        </div>

        <button
          onClick={() => navigate("/super-admin/create-kao")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#18206F] text-white px-3 py-2 font-bold text-sm transition hover:bg-[#18206F]/85"
        >
          <Plus size={18} />
          Onboarding KAO
        </button>
      </div>

      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total KAOs" value={dashboard.stats.totalKAOs} />
        <StatCard label="Total Clients" value={dashboard.stats.totalClients} />
        <StatCard
          label="Total Companies"
          value={dashboard.stats.totalCompanies}
        />
        <StatCard label="Total Uploads" value={dashboard.stats.totalUploads} />
      </div> */}

      {loading ? (
        <div className="rounded-lg border border-[#CBCBD4] bg-white p-8 text-center text-[#18206F]/60">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-[#CBCBD4] bg-white p-5">
              <h2 className="mb-5 text-xl font-bold">Client Growth</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dashboard.charts.clientGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clients" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-[#CBCBD4] bg-white p-5">
              <h2 className="mb-5 text-xl font-bold">Company Growth</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dashboard.charts.companyGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line dataKey="companies" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div> */}

          <DashboardAnalytics
            role="admin"
            dashboard={dashboard}
            analytics={analytics || {}}
          />

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Audit / Activity Logs</h2>
              <p className="mt-1 text-sm text-[#18206F]/60">
                Latest platform actions across onboarding, approvals, updates,
                uploads, and deletions.
              </p>
            </div>
            <DataTable
              columns={[
                { key: "action", label: "Action", sortable: true },
                {
                  key: "entityType",
                  label: "Entity",
                  sortable: true,
                  filterOptions: [
                    "All",
                    "KAO",
                    "Client",
                    "Company",
                    "COMPANY",
                    "ComplianceUpload",
                  ],
                },
                { key: "userEmail", label: "User", sortable: true },
                {
                  key: "status",
                  label: "Status",
                  sortable: true,
                  filterOptions: ["All", "SUCCESS", "FAILED"],
                  render: (row) => row.status || "SUCCESS",
                },
                {
                  key: "createdAt",
                  label: "Date",
                  sortable: true,
                  render: (row) =>
                    row.createdAt
                      ? new Date(row.createdAt).toLocaleString()
                      : "-",
                },
              ]}
              data={auditLogs.slice(0, 50)}
              pageSize={5}
              pageSizeOptions={[5, 10, 20]}
              searchPlaceholder="Search activity..."
            />
          </section>

          {/* <DataSection
            title="KAOs"
            viewAllPath="/super-admin/manage-kaos"
            rows={dashboard.tables.kaos.slice(0, 5)}
            columns={[
              { key: "name", label: "KAO" },
              { key: "email", label: "Email" },
              { key: "totalClients", label: "Clients" },
              { key: "totalCompanies", label: "Companies" },
              {
                key: "role",
                label: "Role",
                render: (row) => row.role || "KAO",
              },
              {
                key: "status",
                label: "Status",
                render: (row) =>
                  row.status
                    ? row.status
                    : row.isActive
                      ? "Active"
                      : "Inactive",
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <ActionButtons
                    row={row}
                    resource="kaos"
                    onDone={handleAction}
                  />
                ),
              },
              linkColumn,
            ]}
          />

          <DataSection
            title="Clients"
            viewAllPath="/super-admin/clients"
            rows={dashboard.tables.clients.slice(0, 5)}
            columns={[
              { key: "name", label: "Client" },
              { key: "kaoName", label: "KAO" },
              { key: "email", label: "Email" },
              { key: "totalCompanies", label: "Companies" },
              {
                key: "role",
                label: "Role",
                render: (row) => row.role || "CLIENT",
              },
              {
                key: "status",
                label: "Status",
                render: (row) =>
                  row.status
                    ? row.status
                    : row.isActive
                      ? "Active"
                      : "Inactive",
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <ActionButtons
                    row={row}
                    resource="clients"
                    onDone={handleAction}
                  />
                ),
              },
              linkColumn,
            ]}
          />

          <DataSection
            title="Companies"
            viewAllPath="/super-admin/companies"
            rows={dashboard.tables.companies.slice(0, 5)}
            columns={[
              { key: "name", label: "Company" },
              { key: "clientName", label: "Client" },
              { key: "kaoName", label: "KAO" },
              { key: "totalUploads", label: "Uploads" },
              {
                key: "role",
                label: "Role",
                render: (row) => row.role || "COMPANY",
              },
              {
                key: "status",
                label: "Status",
                render: (row) =>
                  row.status
                    ? row.status
                    : row.isActive
                      ? "Active"
                      : "Inactive",
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <ActionButtons
                    row={row}
                    resource="companies"
                    onDone={handleAction}
                  />
                ),
              },
              linkColumn,
            ]}
          />

          <DataSection
            title="Compliance"
            viewAllPath="/super-admin/analytics"
            rows={compliances.slice(0, 5)}
            columns={[
              {
                key: "compliance",
                label: "Compliance",
                render: (row) => row.compliance || row.title || "-",
              },
              {
                key: "companyName",
                label: "Company",
                render: (row) => row.companyName || "-",
              },
              {
                key: "clientName",
                label: "Client",
                render: (row) => row.clientName || "-",
              },
              {
                key: "kaoName",
                label: "KAO",
                render: (row) => row.kaoName || "-",
              },
              {
                key: "lawArea",
                label: "Law Area",
                render: (row) => row.lawArea || "-",
              },
              {
                key: "effectiveStatus",
                label: "Status",
                render: (row) => row.effectiveStatus || row.status || "-",
              },
              {
                key: "effectiveRisk",
                label: "Risk",
                render: (row) => row.effectiveRisk || row.risk || "-",
              },
              {
                key: "dueDate",
                label: "Due Date",
                render: (row) =>
                  row.dueDate
                    ? new Date(row.dueDate).toLocaleDateString()
                    : "-",
              },
            ]}
          /> */}

          {/* <div className="rounded-lg border border-[#CBCBD4] bg-white p-5">
            <h2 className="mb-5 text-xl font-bold">Monthly Uploads</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dashboard.charts.monthlyUploads}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="uploads" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div> */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/super-admin/manage-kaos"
              className="flex items-center gap-3 rounded-lg border border-[#CBCBD4] bg-white p-5 hover:bg-[#18206F]/5"
            >
              <Users />
              KAOs data table
            </Link>
            <Link
              to="/super-admin/clients"
              className="flex items-center gap-3 rounded-lg border border-[#CBCBD4] bg-white p-5 hover:bg-[#18206F]/5"
            >
              <Users />
              Clients data table
            </Link>
            <Link
              to="/super-admin/companies"
              className="flex items-center gap-3 rounded-lg border border-[#CBCBD4] bg-white p-5 hover:bg-[#18206F]/5"
            >
              <Building2 />
              Companies data table
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
