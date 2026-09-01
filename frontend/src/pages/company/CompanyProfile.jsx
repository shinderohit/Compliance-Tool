import { useEffect, useState } from "react";
import API from "../../api/axios";

const registrationFields = [
  ["pan", "PAN"],
  ["gst", "GST"],
  ["tan", "TAN"],
  ["cin", "CIN"],
  ["msme", "MSME"],
  ["iec", "IEC"],
  ["pf", "PF"],
  ["esic", "ESIC"],
  ["lwf", "LWF"],
  ["pt", "PT"],
  ["factoryLicense", "Factory License"],
  ["tradeLicense", "Trade License"],
];

const profileFields = [
  ["name", "Company/Branch Name"],
  ["phone", "Phone"],
  ["website", "Website"],
  ["address", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "Pincode"],
  ["description", "Description"],
];

export default function CompanyProfile() {
  const [form, setForm] = useState({});
  const [industries, setIndustries] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, industriesRes, businessTypesRes] = await Promise.all(
          [
            API.get("/company/profile"),
            API.get("/master/industries"),
            API.get("/master/business-types"),
          ],
        );

        setForm(profileRes.data.profile || {});
        setIndustries(industriesRes.data || []);
        setBusinessTypes(businessTypesRes.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const res = await API.put("/company/profile", form);
      setForm(res.data.profile || {});
      alert("Company/Branch profile updated");
    } catch (error) {
      console.log(error);
      alert("Failed to update company/branch profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-[#18206F]/60">Loading company/branch profile...</div>
    );
  }

  return (
    <form onSubmit={saveProfile} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Company/Branch Profile</h1>
        <p className="mt-2 text-[#18206F]/60">
          Maintain registrations, statutory identifiers, industry details, and
          business information.
        </p>
      </div>

      <section className="rounded-xl border border-[#CBCBD4] bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Business Details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {profileFields.map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm font-semibold">
              <span>{label}</span>
              <input
                value={form[key] || ""}
                onChange={(event) => updateField(key, event.target.value)}
                className="w-full rounded-lg border border-[#CBCBD4] px-3 py-2"
              />
            </label>
          ))}
          <label className="space-y-2 text-sm font-semibold">
            <span>Industry</span>
            <select
              value={form.industryId || ""}
              onChange={(event) =>
                updateField("industryId", event.target.value)
              }
              className="w-full rounded-lg border border-[#CBCBD4] px-3 py-2"
            >
              <option value="">Select industry</option>
              {industries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Business Type</span>
            <select
              value={form.businessTypeId || ""}
              onChange={(event) =>
                updateField("businessTypeId", event.target.value)
              }
              className="w-full rounded-lg border border-[#CBCBD4] px-3 py-2"
            >
              <option value="">Select business type</option>
              {businessTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[#CBCBD4] bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Registrations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {registrationFields.map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm font-semibold">
              <span>{label}</span>
              <input
                value={form[key] || ""}
                onChange={(event) => updateField(key, event.target.value)}
                className="w-full rounded-lg border border-[#CBCBD4] px-3 py-2"
              />
            </label>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#18206F] px-5 py-2 font-bold text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
