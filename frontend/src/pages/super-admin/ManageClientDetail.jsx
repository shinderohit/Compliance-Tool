import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import ConfirmModal from "../../components/modals/ConfirmModal";

export default function ManageClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/super-admin/clients/${id}`);
        setClient(res.data.data);
        setName(res.data.data.name || "");
        setEmail(res.data.data.email || "");
      } catch (err) {
        console.log(err);
        alert("Failed to load client");
        navigate(-1);
      }
    };

    fetch();
  }, [id, navigate]);

  if (!client) return <div>Loading...</div>;

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
        const isActive = !client.isActive;
        await API.patch(`/super-admin/clients/${id}/status`, { isActive });
        setClient((c) => ({ ...c, isActive }));
      } else if (confirmType === "delete") {
        await API.delete(`/super-admin/clients/${id}`);
        navigate("/super-admin/clients");
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
      const res = await API.patch(`/super-admin/clients/${id}`, {
        name,
        email,
      });
      setClient(res.data.data);
      setName(res.data.data.name || "");
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
      <h1 className="text-2xl font-bold">Manage Client: {client.name}</h1>

      <div className="rounded-lg border border-[#CBCBD4] bg-white p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-[#18206F]/60">
              Client Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label className="block text-sm text-[#18206F]/60">KAO</label>
            <input
              value={client.kaoName}
              readOnly
              className="mt-1 w-full rounded border bg-[#18206F]/5 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-[#18206F]/60">Slug</label>
            <input
              value={client.slug}
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
            <strong>Companies:</strong> {client.totalCompanies}
          </p>
          <p>
            <strong>Status:</strong> {client.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "delete"
            ? `Delete ${client.name}?`
            : `Toggle ${client.name}?`
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
