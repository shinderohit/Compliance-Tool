import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ConfirmModal from "./modals/ConfirmModal";
import { FaExternalLinkAlt, FaEdit, FaTrash } from "react-icons/fa";

export default function ActionButtons({ row, resource, onDone }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'delete'
  const [loading, setLoading] = useState(false);

  const openConfirm = (type) => {
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  const handleConfirm = async () => {
    if (!confirmType) return;
    setLoading(true);
    try {
      if (confirmType === "delete") {
        await API.delete(`/super-admin/${resource}/${row.id}`);
        onDone && onDone({ action: "delete", id: row.id, resource });
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmType(null);
    }
  };

  const managePath =
    resource === "kaos"
      ? `/super-admin/manage-kaos/${row.id}`
      : resource === "clients"
        ? `/super-admin/manage-client/${row.id}`
        : `/super-admin/manage-company/${row.id}`;

  const allowDelete = !["kaos", "clients", "companies"].includes(resource);

  return (
    <div className="inline-flex items-center gap-3">
      <a
        href={row.loginUrl || `/${managePath.split("/").slice(1).join("/")}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open login"
        aria-label="Open login"
        className="text-blue-600 hover:text-blue-700 p-2 rounded"
      >
        <FaExternalLinkAlt />
      </a>

      <button
        type="button"
        onClick={() => navigate(managePath)}
        title="Manage"
        aria-label="Manage"
        className="text-[#18206F]/70 hover:text-[#18206F] p-2 rounded"
      >
        <FaEdit />
      </button>

      {allowDelete && (
        <>
          <button
            disabled={loading}
            onClick={() => openConfirm("delete")}
            title="Delete"
            aria-label="Delete"
            className="text-red-600 hover:text-red-700 p-2 rounded"
          >
            <FaTrash />
          </button>

          <ConfirmModal
            open={confirmOpen}
            title={
              confirmType === "delete"
                ? `Delete ${row.name}?`
                : `Toggle ${row.name}?`
            }
            message={
              confirmType === "delete"
                ? "This cannot be undone."
                : "Confirm change of active status."
            }
            confirmLabel={confirmType === "delete" ? "Delete" : "Confirm"}
            onConfirm={handleConfirm}
            onCancel={handleConfirmCancel}
          />
        </>
      )}

      {!allowDelete && (
        <ConfirmModal
          open={confirmOpen}
          title={`Toggle ${row.name}?`}
          message="Confirm change of active status."
          confirmLabel="Confirm"
          onConfirm={handleConfirm}
          onCancel={handleConfirmCancel}
        />
      )}
    </div>
  );
}
