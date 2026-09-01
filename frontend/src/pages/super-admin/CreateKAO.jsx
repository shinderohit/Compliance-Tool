import { ExternalLink } from "lucide-react";
import { useState } from "react";
import API from "../../api/axios";

export default function CreateKAO() {
  const [formData, setFormData] = useState({
    organizationName: "",
    name: "",
    email: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdKao, setCreatedKao] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setCreatedKao(null);

      const res = await API.post("/super-admin/create-kao", formData);

      setCreatedKao(res.data.data);
      setFormData({
        organizationName: "",
        name: "",
        email: "",
        contactNumber: "",
      });
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "KAO onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding KAO</h1>
        <p className="mt-2 text-lg text-[#18206F]/60">
          Onboarding a master organization tenant and its admin login.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-2 rounded-lg border border-[#CBCBD4] bg-white p-6 text-md"
      >
        <input
          type="text"
          name="organizationName"
          placeholder="KAO Organization Name"
          value={formData.organizationName}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          type="text"
          name="name"
          placeholder="KAO Admin Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="KAO Admin Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-[#18206F] text-white p-3 font-bold transition hover:bg-[#18206F]/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Onboarding..." : "Onboarding KAO"}
        </button>
      </form>

      {createdKao && (
        <div className="rounded-lg border border-green-700 bg-green-950/40 p-5">
          <p className="font-semibold text-green-700">
            {createdKao.name} created successfully
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={createdKao.loginUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-700"
            >
              {createdKao.loginUrl}
              <ExternalLink size={16} />
            </a>
            <button
              type="button"
              onClick={() =>
                window.open(createdKao.loginUrl, "_blank", "noopener")
              }
              className="rounded-lg bg-[#18206F]/5 px-4 py-2 text-sm text-[#18206F] transition hover:bg-[#D4AF37]/15"
            >
              Open Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
