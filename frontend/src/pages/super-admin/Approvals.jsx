import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await API.get("/super-admin/approvals");
      setApprovals(res.data?.approvals || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const updateApproval = async (item, status) => {
    await API.patch(`/super-admin/approvals/${item.entityType}/${item.id}`, {
      status,
    });
    fetchApprovals();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="mt-2 text-[#18206F]/60">
          Approve completed onboarding records before their login can access the
          portal.
        </p>
      </div>
      <section className="overflow-hidden rounded-lg border border-[#CBCBD4] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#18206F]/5">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">System ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center" colSpan="5">
                  Loading approvals...
                </td>
              </tr>
            ) : approvals.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center" colSpan="5">
                  No pending approvals
                </td>
              </tr>
            ) : (
              approvals.map((item) => (
                <tr key={`${item.entityType}-${item.id}`} className="border-t">
                  <td className="px-4 py-3 font-semibold">
                    {item.entityType}
                  </td>
                  <td className="px-4 py-3">{item.code || "-"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-[#18206F]/60">{item.email}</p>
                  </td>
                  <td className="px-4 py-3">{item.owner || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateApproval(item, "APPROVED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 font-semibold text-white"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApproval(item, "REJECTED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
