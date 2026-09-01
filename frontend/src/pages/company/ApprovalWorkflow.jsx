import { useEffect, useState } from "react";
import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const badgeClass = (status) => {
  if (status === "APPROVED") return "bg-green-50 text-green-700 ring-green-200";
  if (status === "REJECTED") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "PENDING_APPROVAL")
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  return "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]";
};

const ApprovalBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeClass(
      status,
    )}`}
  >
    {(status || "DRAFT").replaceAll("_", " ")}
  </span>
);

export default function ApprovalWorkflow() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await API.get("/approvals");
      setApprovals(res.data?.approvals || []);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const approve = async (row) => {
    try {
      await API.post(`/approvals/${row.id}/approve`);
      await fetchApprovals();
      alert("Compliance approved");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Approval failed");
    }
  };

  const reject = async (row) => {
    const reason = window.prompt("Reject reason:", row.rejectionReason || "");
    if (reason === null) return;

    try {
      await API.post(`/approvals/${row.id}/reject`, { reason });
      await fetchApprovals();
      alert("Compliance rejected");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Rejection failed");
    }
  };

  const columns = [
    {
      key: "approvalStatus",
      label: "Approval",
      accessor: (row) => row.approvalStatus || "DRAFT",
      render: (row) => <ApprovalBadge status={row.approvalStatus} />,
      filterOptions: ["All", "PENDING_APPROVAL", "APPROVED", "REJECTED"],
      sortable: true,
    },
    {
      key: "compliance",
      label: "Compliance",
      accessor: (row) => row.compliance || row.complianceType || "-",
      sortable: true,
    },
    { key: "lawArea", label: "Law Area", accessor: (row) => row.lawArea || "-", sortable: true },
    { key: "department", label: "Department", accessor: (row) => row.department || "-", sortable: true },
    {
      key: "dueDate",
      label: "Due Date",
      accessor: (row) => formatDate(row.dueDate),
      sortValue: (row) => new Date(row.dueDate || 0).getTime(),
      sortable: true,
    },
    {
      key: "approvedBy",
      label: "Approved By",
      accessor: (row) => row.approvedBy || "-",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) =>
        row.approvalStatus === "PENDING_APPROVAL" ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => approve(row)}
              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => reject(row)}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Reject
            </button>
          </div>
        ) : (
          row.rejectionReason || "-"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval Workflow</h1>
        <p className="mt-2 text-lg text-[#18206F]/60">
          Review compliance records submitted for approval and track approval
          decisions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={approvals}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search approvals..."
      />
    </div>
  );
}
