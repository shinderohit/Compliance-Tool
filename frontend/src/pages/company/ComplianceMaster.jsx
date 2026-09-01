import { useEffect, useState } from "react";
import DocumentReviewModal from "../../components/documents/DocumentReviewModal";
import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const riskBadgeClass = (risk) => {
  if (risk === "High") return "bg-red-50 text-red-700 ring-red-200";
  if (risk === "Medium") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  if (risk === "Low") return "bg-green-50 text-green-700 ring-green-200";
  return "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]";
};

const statusBadgeClass = (status) => {
  if (status === "Completed" || status === "Complied")
    return "bg-green-50 text-green-700 ring-green-200";
  if (status === "Overdue" || status === "Rejected")
    return "bg-red-50 text-red-700 ring-red-200";
  if (status === "Pending")
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  return "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]";
};

const REGISTRATION_COLUMNS = [
  { key: "gst", label: "GST" },
  { key: "pf", label: "PF" },
  { key: "esic", label: "ESIC" },
  { key: "pt", label: "PT" },
  { key: "lwf", label: "LWF" },
  { key: "se", label: "S&E" },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getDocumentNames = (documents) =>
  Object.values(documents || {})
    .map((document) => document?.originalName)
    .filter(Boolean);

const Badge = ({ value, className }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
  >
    {value || "Unknown"}
  </span>
);

function RegistrationCell({ item, registrationKey }) {
  const registration = item.registrations?.[registrationKey] || {};
  const document = item.documents?.[`${registrationKey}Document`];
  const [review, setReview] = useState({ open: false, url: null, name: null });

  return (
    <div className="min-w-40 space-y-1">
      <p className="font-semibold text-[#18206F]">
        {registration.number || "-"}
      </p>
      <p className="text-xs text-[#18206F]/60">
        Applicable: {formatDate(registration.applicableDate)}
      </p>
      <p className="text-xs text-[#18206F]/60">
        Expires: {formatDate(registration.expiryDate)}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-[#18206F]/70">
          {document?.originalName || "No document"}
        </p>
        {document?.fileUrl && (
          <button
            onClick={() =>
              setReview({
                open: true,
                url: document.fileUrl,
                name: document.originalName,
              })
            }
            className="rounded-md border border-[#CBCBD4] px-2 py-1 text-xs font-semibold"
          >
            Document Review
          </button>
        )}
      </div>

      <DocumentReviewModal
        open={Boolean(review.open)}
        url={review.url}
        name={review.name}
        onClose={() => setReview({ open: false, url: null, name: null })}
      />
    </div>
  );
}

export default function ComplianceMaster() {
  const [compliances, setCompliances] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    complied: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const exportComplianceExcel = () => {
    const rows = compliances.map((row) => ({
      UIN: row.uin || "",
      Company: row.companyName || "",
      State: row.state || "",
      Location: row.location || "",
      "Law Area": row.lawArea || "",
      "Act / Rule": row.actRule || "",
      Compliance: row.compliance || "",
      Type: row.complianceType || "",
      "AI Score": row.complianceScore ?? "",
      "Due Date": formatDate(row.dueDate),
      "Expiry Date": formatDate(row.expiryDate),
      Risk: row.effectiveRisk || row.risk || "",
      Status: row.effectiveStatus || row.status || "",
      Priority: row.priority || "",
      Department: row.department || "",
      "Assigned To": row.assignedTo || "",
      GST: row.gstNumber || row.registrations?.gst?.number || "",
      PAN: row.panNumber || "",
      Branches:
        Array.isArray(row.branches) && row.branches.length > 0
          ? row.branches.map((branch) => branch.name).join(", ")
          : "",
      Documents: getDocumentNames(row.documents).join(", "),
      Remarks: row.remarks || "",
      Created: formatDate(row.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Master");
    XLSX.writeFile(workbook, "Compliance_Master.xlsx");
  };

  const exportCompliancePdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const headers = [
      [
        "UIN",
        "Company",
        "State",
        "Location",
        "Law Area",
        "Act / Rule",
        "Compliance",
        "Type",
        "AI Score",
        "Due Date",
        "Expiry Date",
        "Risk",
        "Status",
        "Priority",
        "Department",
        "Assigned To",
        "GST",
        "PAN",
        "Branches",
        "Documents",
        "Remarks",
        "Created",
      ],
    ];

    const data = compliances.map((row) => [
      row.uin || "",
      row.companyName || "",
      row.state || "",
      row.location || "",
      row.lawArea || "",
      row.actRule || "",
      row.compliance || "",
      row.complianceType || "",
      row.complianceScore ?? "",
      formatDate(row.dueDate),
      formatDate(row.expiryDate),
      row.effectiveRisk || row.risk || "",
      row.effectiveStatus || row.status || "",
      row.priority || "",
      row.department || "",
      row.assignedTo || "",
      row.gstNumber || row.registrations?.gst?.number || "",
      row.panNumber || "",
      Array.isArray(row.branches) && row.branches.length > 0
        ? row.branches.map((branch) => branch.name).join(", ")
        : "",
      getDocumentNames(row.documents).join(", "),
      row.remarks || "",
      formatDate(row.createdAt),
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [22, 54, 117] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
      didDrawPage: (dataArg) => {
        doc.setFontSize(14);
        doc.text("Compliance Master", dataArg.settings.margin.left, 24);
      },
    });

    doc.save("Compliance_Master.pdf");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [masterRes, kpiRes] = await Promise.all([
        API.get("/compliance/master"),
        API.get("/compliance/master/kpis"),
      ]);

      setCompliances(masterRes.data.compliances || []);
      setKpis(kpiRes.data.cards || {});
    } catch (err) {
      console.log(err);
      setError("Failed to load compliance master data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const kpiCards = [
    {
      label: "Total",
      value: kpis.total ?? 0,
      className: "text-[#18206F]",
    },
    {
      label: "Completed",
      value: kpis.complied ?? 0,
      className: "text-green-700",
    },
    {
      label: "Pending",
      value: kpis.pending ?? 0,
      className: "text-yellow-700",
    },
    {
      label: "Overdue",
      value: kpis.overdue ?? 0,
      className: "text-red-700",
    },
    {
      label: "Due Today",
      value: kpis.dueToday ?? 0,
      className: "text-blue-700",
    },
  ];

  const submitForApproval = async (row) => {
    try {
      await API.post(`/approvals/${row.id}/submit`);
      await fetchData();
      alert("Compliance submitted for approval");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to submit approval");
    }
  };

  const approvalBadgeClass = (status) => {
    if (status === "APPROVED")
      return "bg-green-50 text-green-700 ring-green-200";
    if (status === "REJECTED") return "bg-red-50 text-red-700 ring-red-200";
    if (status === "PENDING_APPROVAL")
      return "bg-yellow-50 text-yellow-700 ring-yellow-200";
    return "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]";
  };

  const columns = [
    {
      key: "approvalStatus",
      label: "Approval",
      accessor: (row) => row.approvalStatus || "DRAFT",
      render: (row) => {
        const status = row.approvalStatus || "DRAFT";
        return (
          <Badge
            value={status.replaceAll("_", " ")}
            className={approvalBadgeClass(status)}
          />
        );
      },
      sortable: true,
      filterOptions: [
        "All",
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
      ],
    },
    {
      key: "uin",
      label: "UIN",
      accessor: (row) => row.uin || "-",
      sortable: true,
    },
    {
      key: "companyName",
      label: "Company/Branch",
      accessor: (row) => row.companyName || "-",
      sortable: true,
    },
    {
      key: "state",
      label: "State",
      accessor: (row) => row.state || "-",
      sortable: true,
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) => row.location || "-",
      sortable: true,
    },
    {
      key: "lawArea",
      label: "Law Area",
      accessor: (row) => row.lawArea || "-",
      sortable: true,
    },
    {
      key: "actRule",
      label: "Act / Rule",
      accessor: (row) => row.actRule || "-",
      sortable: true,
    },
    {
      key: "compliance",
      label: "Compliance",
      accessor: (row) => row.compliance || "-",
      sortable: true,
    },
    {
      key: "complianceType",
      label: "Type",
      accessor: (row) => row.complianceType || "-",
      sortable: true,
    },
    {
      key: "complianceScore",
      label: "AI Score",
      accessor: (row) => row.complianceScore ?? "-",
      sortValue: (row) => Number(row.complianceScore ?? -1),
      sortable: true,
    },
    {
      key: "dueDate",
      label: "Due Date",
      accessor: (row) => formatDate(row.dueDate),
      sortValue: (row) => new Date(row.dueDate || 0).getTime(),
      sortable: true,
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      accessor: (row) => formatDate(row.expiryDate),
      sortValue: (row) => new Date(row.expiryDate || 0).getTime(),
      sortable: true,
    },
    {
      key: "risk",
      label: "Risk",
      accessor: (row) => row.effectiveRisk || row.risk || "Unknown",
      render: (row) => {
        const risk = row.effectiveRisk || row.risk || "Unknown";
        return <Badge value={risk} className={riskBadgeClass(risk)} />;
      },
      sortable: true,
      filterOptions: ["All", "High", "Medium", "Low", "Unknown"],
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => row.effectiveStatus || row.status || "Unknown",
      render: (row) => {
        const status = row.effectiveStatus || row.status || "Unknown";
        return <Badge value={status} className={statusBadgeClass(status)} />;
      },
      sortable: true,
      filterOptions: [
        "All",
        "Completed",
        "Complied",
        "Pending",
        "Overdue",
        "Rejected",
        "Unknown",
      ],
    },
    {
      key: "priority",
      label: "Priority",
      accessor: (row) => row.priority || "-",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.department || "-",
      sortable: true,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      accessor: (row) => row.assignedTo || "-",
      sortable: true,
    },
    {
      key: "frequency",
      label: "Frequency",
      accessor: (row) => row.frequency || "-",
      sortable: true,
    },
    {
      key: "gstNumber",
      label: "GST",
      accessor: (row) => row.gstNumber || row.registrations?.gst?.number || "-",
      sortable: true,
    },
    {
      key: "panNumber",
      label: "PAN",
      accessor: (row) => row.panNumber || "-",
      sortable: true,
    },
    ...REGISTRATION_COLUMNS.map((column) => ({
      key: `${column.key}Registration`,
      label: column.label,
      accessor: (row) => row.registrations?.[column.key]?.number || "-",
      render: (row) => (
        <RegistrationCell item={row} registrationKey={column.key} />
      ),
      sortable: true,
    })),
    {
      key: "branches",
      label: "Branches",
      accessor: (row) =>
        Array.isArray(row.branches) && row.branches.length > 0
          ? row.branches
              .map((branch) => branch.name)
              .filter(Boolean)
              .join(", ")
          : "-",
      render: (row) =>
        Array.isArray(row.branches) && row.branches.length > 0 ? (
          <div className="min-w-44 space-y-2">
            {row.branches.map((branch, index) => (
              <div key={`${branch.name || "branch"}-${index}`}>
                <p className="font-semibold text-[#18206F]">
                  {branch.name || `Branch ${index + 1}`}
                </p>
                <p className="text-xs text-[#18206F]/60">
                  {[branch.location, branch.state].filter(Boolean).join(", ") ||
                    "-"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          "-"
        ),
      sortable: true,
    },
    {
      key: "documents",
      label: "Documents",
      accessor: (row) => getDocumentNames(row.documents).join(", ") || "-",
      render: (row) => {
        const names = getDocumentNames(row.documents);
        return names.length > 0 ? (
          <div className="min-w-40 space-y-1">
            {names.map((name) => (
              <p key={name} className="text-xs text-[#18206F]/75">
                {name}
              </p>
            ))}
          </div>
        ) : (
          "-"
        );
      },
      sortable: true,
    },
    {
      key: "remarks",
      label: "Remarks",
      accessor: (row) => row.remarks || "-",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      accessor: (row) => formatDate(row.createdAt),
      sortValue: (row) => new Date(row.createdAt || 0).getTime(),
      sortable: true,
    },
    {
      key: "workflow",
      label: "Workflow",
      sortable: false,
      render: (row) =>
        row.approvalStatus === "APPROVED" ||
        row.approvalStatus === "PENDING_APPROVAL" ? (
          "-"
        ) : (
          <button
            type="button"
            onClick={() => submitForApproval(row)}
            className="rounded-lg bg-[#18206F] px-3 py-2 text-xs font-semibold text-white"
          >
            Submit
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Master</h1>
          <p className="mt-2 text-lg text-[#18206F]/60">
            Search, filter, sort, and review all compliance obligations in one
            place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={exportComplianceExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-[#18206F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18206F]/90"
          >
            <FaFileExcel />
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportCompliancePdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D32F2F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D32F2F]/90"
          >
            <FaFilePdf />
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#CBCBD4] bg-white p-4"
          >
            <p className="text-sm text-[#18206F]/60">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.className}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={compliances}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search compliance master..."
      />
    </div>
  );
}
