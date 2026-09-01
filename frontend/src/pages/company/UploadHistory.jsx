import { useEffect, useMemo, useState } from "react";
import { FaFileAlt } from "react-icons/fa";

import API from "../../api/axios";
import DocumentReviewModal from "../../components/documents/DocumentReviewModal";
import DataTable from "../../components/tables/DataTable";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { useAuth } from "../../context/AuthContext";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const riskBadgeClass = (risk) => {
  if (risk === "High") return "bg-red-50 text-red-700 ring-red-200";
  if (risk === "Medium") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  if (risk === "Low") return "bg-green-50 text-green-700 ring-green-200";
  return "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]";
};

const getRows = (upload) =>
  Array.isArray(upload.extractedData) ? upload.extractedData : [];

const getIssues = (upload) =>
  Array.isArray(upload.aiAnalysis?.issues) ? upload.aiAnalysis.issues : [];

const getFileLabel = (upload) =>
  upload.title ||
  upload.fileName ||
  upload.fileUrl?.split(/[\\/]/).pop() ||
  "-";

function UploadDetailsModal({ upload, onClose, onReview }) {
  if (!upload) return null;

  const rows = getRows(upload);
  const issues = getIssues(upload);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#CBCBD4] p-5">
          <div>
            <h2 className="text-xl font-bold text-[#18206F]">
              {getFileLabel(upload)}
            </h2>
            <p className="mt-1 text-sm text-[#18206F]/60">
              Uploaded {formatDate(upload.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {upload?.fileUrl && (
              <button
                type="button"
                onClick={() =>
                  onReview &&
                  onReview(upload.fileUrl, upload.title || upload.fileName)
                }
                className="rounded-lg border border-[#CBCBD4] px-3 py-2 text-sm font-semibold text-[#18206F]"
              >
                Document Review
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CBCBD4] px-3 py-2 text-sm font-semibold text-[#18206F]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-[#CBCBD4] p-4">
              <p className="text-sm text-[#18206F]/60">Score</p>
              <p className="mt-1 text-2xl font-bold">
                {upload.complianceScore ?? "-"}%
              </p>
            </div>
            <div className="rounded-lg border border-[#CBCBD4] p-4">
              <p className="text-sm text-[#18206F]/60">Risk</p>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${riskBadgeClass(
                    upload.riskLevel || "Unknown",
                  )}`}
                >
                  {upload.riskLevel || "Unknown"}
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-[#CBCBD4] p-4">
              <p className="text-sm text-[#18206F]/60">Rows Extracted</p>
              <p className="mt-1 text-2xl font-bold">{rows.length}</p>
            </div>
            <div className="rounded-lg border border-[#CBCBD4] p-4">
              <p className="text-sm text-[#18206F]/60">Issues</p>
              <p className="mt-1 text-2xl font-bold">{issues.length}</p>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="font-semibold text-red-700">Detected issues</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-[#CBCBD4]">
            <div className="border-b border-[#CBCBD4] p-4">
              <p className="font-semibold text-[#18206F]">Extracted data</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#18206F]/5 text-[#18206F]/70">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Company/Branch</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">GST</th>
                    <th className="px-3 py-2">PAN</th>
                    <th className="px-3 py-2">Compliance</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-3 py-5 text-center text-[#18206F]/60"
                      >
                        No extracted rows saved for this upload.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr
                        key={`${row.uin || row.companyName || "row"}-${index}`}
                        className="border-t border-[#CBCBD4]"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{row.companyName || "-"}</td>
                        <td className="px-3 py-2">{row.state || "-"}</td>
                        <td className="px-3 py-2">{row.location || "-"}</td>
                        <td className="px-3 py-2">{row.gstNumber || "-"}</td>
                        <td className="px-3 py-2">{row.panNumber || "-"}</td>
                        <td className="px-3 py-2">
                          {row.compliance || row.complianceType || "-"}
                        </td>
                        <td className="px-3 py-2">{row.status || "-"}</td>
                        <td className="px-3 py-2">{row.expiryDate || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadHistory() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [review, setReview] = useState({ open: false, url: null, name: null });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUpload, setTargetUpload] = useState(null);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/compliance/uploads");
      setUploads(Array.isArray(res.data) ? res.data : res.data?.uploads || []);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to load upload history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const stats = useMemo(
    () => ({
      total: uploads.length,
      rows: uploads.reduce(
        (count, upload) => count + getRows(upload).length,
        0,
      ),
      highRisk: uploads.filter((upload) => upload.riskLevel === "High").length,
      issues: uploads.reduce(
        (count, upload) => count + getIssues(upload).length,
        0,
      ),
    }),
    [uploads],
  );

  const handleDelete = (upload) => {
    setTargetUpload(upload);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetUpload) return;

    try {
      setDeleting(true);
      await API.delete(`/compliance/uploads/${targetUpload.id}`);
      setUploads((current) =>
        current.filter((item) => item.id !== targetUpload.id),
      );
      setConfirmOpen(false);
      setTargetUpload(null);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to delete upload.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "File Name",
      accessor: getFileLabel,
      sortable: true,
    },
    {
      key: "companyName",
      label: "Company/Branch",
      accessor: (row) => row.company?.name || "-",
      sortable: true,
    },
    {
      key: "clientName",
      label: "Client",
      accessor: (row) => row.company?.client?.name || "-",
      sortable: true,
    },
    {
      key: "kaoName",
      label: "KAO",
      accessor: (row) => row.company?.client?.kao?.name || "-",
      sortable: true,
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      accessor: (row) => row.uploadedBy?.email || "-",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Upload Date",
      accessor: (row) => formatDate(row.createdAt),
      sortValue: (row) => new Date(row.createdAt || 0).getTime(),
      sortable: true,
    },
    {
      key: "rows",
      label: "Rows",
      accessor: (row) => getRows(row).length,
      sortValue: (row) => getRows(row).length,
      sortable: true,
    },
    {
      key: "complianceScore",
      label: "Score",
      accessor: (row) => `${row.complianceScore ?? 0}%`,
      sortValue: (row) => row.complianceScore ?? 0,
      sortable: true,
    },
    {
      key: "riskLevel",
      label: "Risk Level",
      accessor: (row) => row.riskLevel || "Unknown",
      render: (row) => {
        const risk = row.riskLevel || "Unknown";
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${riskBadgeClass(
              risk,
            )}`}
          >
            {risk}
          </span>
        );
      },
      sortable: true,
      filterOptions: ["All", "Low", "Medium", "High", "Unknown"],
    },
    {
      key: "issues",
      label: "Issues",
      accessor: (row) => getIssues(row).length,
      sortValue: (row) => getIssues(row).length,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <FaFileAlt />
            Upload History
          </h1>

          <p className="mt-2 text-lg text-[#18206F]/60">
            View uploaded compliance files, extracted rows, AI score, risk, and
            detected issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#CBCBD4] bg-white p-4">
          <p className="text-sm text-[#18206F]/60">Uploaded Files</p>
          <p className="mt-2 text-3xl font-bold text-[#18206F]">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-[#CBCBD4] bg-white p-4">
          <p className="text-sm text-[#18206F]/60">Extracted Rows</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{stats.rows}</p>
        </div>
        <div className="rounded-xl border border-[#CBCBD4] bg-white p-4">
          <p className="text-sm text-[#18206F]/60">High Risk</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {stats.highRisk}
          </p>
        </div>
        <div className="rounded-xl border border-[#CBCBD4] bg-white p-4">
          <p className="text-sm text-[#18206F]/60">Detected Issues</p>
          <p className="mt-2 text-3xl font-bold text-yellow-700">
            {stats.issues}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={uploads}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search upload history..."
        onView={setSelectedUpload}
        onDelete={user?.role === "COMPANY" ? handleDelete : undefined}
      />

      <UploadDetailsModal
        upload={selectedUpload}
        onClose={() => setSelectedUpload(null)}
        onReview={(url, name) => setReview({ open: true, url, name })}
      />

      <DocumentReviewModal
        open={Boolean(review.open)}
        url={review.url}
        name={review.name}
        onClose={() => setReview({ open: false, url: null, name: null })}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Remove upload?"
        message="This will permanently delete the upload history record."
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        loading={deleting}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetUpload(null);
        }}
      />
    </div>
  );
}
