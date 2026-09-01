import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import ConfirmModal from "../../components/modals/ConfirmModal";

export default function ManageKAODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kao, setKao] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/super-admin/kaos/${id}`);
        setKao(res.data.data);
        setOrganizationName(res.data.data.name || "");
        setEmail(res.data.data.email || "");
      } catch (err) {
        console.log(err);
        alert("Failed to load KAO");
        navigate(-1);
      }
    };

    fetch();
  }, [id, navigate]);

  if (!kao) return <div>Loading...</div>;

  const openConfirm = (type) => {
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (confirmType === "toggle") {
        const isActive = !kao.isActive;
        await API.patch(`/super-admin/kaos/${id}/status`, { isActive });
        setKao((k) => ({ ...k, isActive }));
      } else if (confirmType === "delete") {
        await API.delete(`/super-admin/kaos/${id}`);
        navigate("/super-admin/manage-kaos");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmType(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { organizationName, email };
      if (adminName) payload.name = adminName;
      const res = await API.patch(`/super-admin/kaos/${id}`, payload);
      setKao(res.data.data);
      setOrganizationName(res.data.data.name || "");
      setEmail(res.data.data.email || "");
      alert("Saved successfully");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage KAO: {kao.name}</h1>

      <div className="rounded-lg border border-[#CBCBD4] bg-white p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-[#18206F]/60">
              Organization Name
            </label>
            <input
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="mt-1 w-full rounded border bg-[#18206F]/5 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-[#18206F]/60">
              Admin Name (optional)
            </label>
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="mt-1 w-full rounded border bg-[#18206F]/5 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-[#18206F]/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border bg-[#18206F]/5 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-[#18206F]/60">Slug</label>
            <input
              value={kao.slug}
              readOnly
              className="mt-1 w-full rounded border bg-[#18206F]/5 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-2 bg-[#18206F] text-white rounded"
          >
            Save
          </button>

          <button
            onClick={() => openConfirm("toggle")}
            disabled={loading}
            className="px-3 py-2 bg-yellow-600 rounded"
          >
            Toggle Status
          </button>
        </div>

        <div className="text-sm text-[#18206F]/60">
          <p>
            <strong>Clients:</strong> {kao.totalClients}
          </p>
          <p>
            <strong>Companies:</strong> {kao.totalCompanies}
          </p>
          <p>
            <strong>Status:</strong> {kao.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "delete"
            ? `Delete ${kao.name}?`
            : `Toggle ${kao.name}?`
        }
        message={
          confirmType === "delete"
            ? "This cannot be undone."
            : "Confirm change of active status."
        }
        confirmLabel={confirmType === "delete" ? "Delete" : "Confirm"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
