import { useEffect, useState } from "react";
import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/audit");
      setLogs(res.data?.logs || []);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    { key: "action", label: "Action", accessor: (row) => row.action || "-", sortable: true },
    {
      key: "entityType",
      label: "Entity",
      accessor: (row) => row.entityType || "-",
      sortable: true,
    },
    {
      key: "entityId",
      label: "Entity ID",
      accessor: (row) => row.entityId || "-",
      sortable: true,
    },
    {
      key: "userEmail",
      label: "User",
      accessor: (row) => row.userEmail || "-",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => row.status || "-",
      filterOptions: ["All", "SUCCESS", "FAILED"],
      sortable: true,
    },
    {
      key: "reason",
      label: "Reason",
      accessor: (row) => row.reason || "-",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      accessor: (row) => formatDate(row.createdAt),
      sortValue: (row) => new Date(row.createdAt || 0).getTime(),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="mt-2 text-lg text-[#18206F]/60">
          Search and review portal activity across creation, changes, deletion,
          approval, and upload workflows.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search activity logs..."
      />
    </div>
  );
}
