import { useEffect, useState } from "react";
import API from "../../api/axios";

const emptyBranch = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyBranch);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await API.get("/company/branches");
      setBranches(res.data.branches || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    API.get("/company/branches")
      .then((res) => {
        if (isMounted) setBranches(res.data.branches || []);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createBranch = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await API.post("/company/branches", form);
      setForm(emptyBranch);
      fetchBranches();
    } catch (error) {
      console.log(error);
      alert("Failed to onboard branch");
    } finally {
      setSaving(false);
    }
  };

  const deleteBranch = async (branchId) => {
    if (!window.confirm("Delete branch?")) return;

    await API.delete(`/company/branches/${branchId}`);
    fetchBranches();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Branches</h1>
        <p className="mt-2 text-[#18206F]/60">
          Create branch-wise compliance scope for Mumbai, Pune, Delhi,
          Hyderabad, and any other operating location.
        </p>
      </div>

      <form
        onSubmit={createBranch}
        className="rounded-xl border border-[#CBCBD4] bg-white p-5"
      >
        <h2 className="mb-4 text-xl font-bold">Add Branch</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Object.keys(emptyBranch).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={form[key]}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: event.target.value }))
              }
              className="rounded-lg border border-[#CBCBD4] px-3 py-2"
              required={key === "name" || key === "code"}
            />
          ))}
        </div>
        <button
          disabled={saving}
          className="mt-4 rounded-lg bg-[#18206F] px-5 py-2 font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Branch"}
        </button>
      </form>

      <section className="overflow-hidden rounded-xl border border-[#CBCBD4] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#18206F]/5">
            <tr>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Employees</th>
              <th className="px-4 py-3">Compliances</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  Loading branches...
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  No branches found
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="border-t border-[#CBCBD4]">
                  <td className="px-4 py-3 font-semibold">{branch.name}</td>
                  <td className="px-4 py-3">{branch.code}</td>
                  <td className="px-4 py-3">{branch.city || "-"}</td>
                  <td className="px-4 py-3">{branch.state || "-"}</td>
                  <td className="px-4 py-3">{branch.employees?.length || 0}</td>
                  <td className="px-4 py-3">
                    {branch.compliances?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteBranch(branch.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
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
