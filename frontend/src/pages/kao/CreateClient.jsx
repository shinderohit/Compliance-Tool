import { ExternalLink, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api/axios";
import { governmentIndustries, statutoryDocuments } from "../../data/onboardingFlow";

const initialForm = {
  companyName: "",
  companyNameAsPerGstCertificate: "",
  name: "",
  email: "",
  kaoId: "",
  seDetails: "",
  natureOfWork: "",
  industryId: "",
  appropriateGovernment: "",
  serviceModel: "SAAS",
  state: "",
  city: "",
  location: "",
  pincode: "",
  panNumber: "",
  gstNumber: "",
  pfNumber: "",
  esicNumber: "",
  ptNumber: "",
  lwfNumber: "",
};

export default function CreateClient() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    panCertificate: null,
    gstCertificate: null,
    seCertificate: null,
    pfCertificate: null,
    esicCertificate: null,
    ptCertificate: null,
    lwfCertificate: null,
    bulkUpload: null,
  });
  const [loading, setLoading] = useState(false);
  const [kaos, setKaos] = useState([]);
  const [kaosLoading, setKaosLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchKaos = async () => {
      try {
        setKaosLoading(true);
        const res = await API.get("/super-admin/kaos", {
          params: {
            limit: 100,
          },
        });
        setKaos(res.data?.data || []);
      } catch (error) {
        console.log(error);
        alert("Failed to load KAOs");
      } finally {
        setKaosLoading(false);
      }
    };

    fetchKaos();
  }, [isSuperAdmin]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files?.[0] || null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setCreatedClient(null);

      const endpoint = isSuperAdmin
        ? "/super-admin/create-client"
        : "/kao/create-client";
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (isSuperAdmin || key !== "kaoId") {
          payload.append(key, value);
        }
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      const res = await API.post(endpoint, payload);

      setCreatedClient({
        name: res.data.client.name,
        loginUrl: res.data.loginUrl,
      });

      setForm(initialForm);
      setFiles({
        panCertificate: null,
        gstCertificate: null,
        seCertificate: null,
        pfCertificate: null,
        esicCertificate: null,
        ptCertificate: null,
        lwfCertificate: null,
        bulkUpload: null,
      });
      e.target.reset();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Client onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Client</h1>
        <p className="mt-2 text-[#18206F]/60 text-lg">
          Onboarding a client tenant, capturing onboarding details, and
          generating its login URL.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 text-md md:grid-cols-2"
      >
        <input
          name="companyName"
          placeholder="Client Name"
          value={form.companyName}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <select
          name="serviceModel"
          value={form.serviceModel}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        >
          <option value="SAAS">SaaS - managed by platform</option>
          <option value="PAAS">PaaS - portal handover to client</option>
        </select>

        <input
          name="companyNameAsPerGstCertificate"
          placeholder="Company Name as per GST Certificate"
          value={form.companyNameAsPerGstCertificate}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="name"
          placeholder="Client Admin Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="email"
          type="email"
          placeholder="Client Admin Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="seDetails"
          placeholder="S&E Details"
          value={form.seDetails}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="natureOfWork"
          placeholder="Nature of Work"
          value={form.natureOfWork}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <select
          name="appropriateGovernment"
          value={form.appropriateGovernment}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        >
          <option value="">Select Appropriate Government</option>
          <option value="CENTRAL">Central</option>
          <option value="STATE">State</option>
        </select>

        <select
          name="industryId"
          value={form.industryId}
          onChange={handleChange}
          required
          disabled={!form.appropriateGovernment}
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        >
          <option value="">Select Industry</option>
          {(governmentIndustries[form.appropriateGovernment] || []).map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        {isSuperAdmin && (
          <select
            name="kaoId"
            value={form.kaoId}
            onChange={handleChange}
            required
            disabled={kaosLoading}
            className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          >
            <option value="">
              {kaosLoading ? "Loading KAOs..." : "Select KAO"}
            </option>
            {kaos.map((kao) => (
              <option key={kao.id} value={kao.id}>
                {kao.name}
              </option>
            ))}
          </select>
        )}

        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="city" placeholder="City / District" value={form.city} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="pincode" placeholder="Pin-code" value={form.pincode} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="panNumber" placeholder="PAN Number" value={form.panNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="gstNumber" placeholder="GST Number" value={form.gstNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="pfNumber" placeholder="PF Number" value={form.pfNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="esicNumber" placeholder="ESIC Number" value={form.esicNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="ptNumber" placeholder="PT Number" value={form.ptNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />
        <input name="lwfNumber" placeholder="LWF Number" value={form.lwfNumber} onChange={handleChange} required className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none" />

        {statutoryDocuments.map(([name, label]) => (
          <label key={name} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70">
            <Upload size={18} />
            <span className="min-w-0 flex-1 truncate">{files[name]?.name || label}</span>
            <input name={name} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} required className="sr-only" />
          </label>
        ))}

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70 md:col-span-2">
          <Upload size={18} />
          <span className="min-w-0 flex-1 truncate">{files.bulkUpload?.name || "Upload Excel / CSV for bulk onboarding"}</span>
          <input name="bulkUpload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="sr-only" />
        </label>

        <button
          disabled={loading || kaosLoading}
          className="w-full rounded-lg bg-[#18206F] text-white p-3 font-bold transition hover:bg-[#18206F]/85 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {loading ? "Onboarding..." : "Onboarding Client"}
        </button>
      </form>

      {createdClient && (
        <div className="rounded-lg border border-green-700 bg-green-950/40 p-5">
          <p className="font-semibold text-green-700">
            {createdClient.name} created successfully
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={createdClient.loginUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-700"
            >
              {createdClient.loginUrl}
              <ExternalLink size={16} />
            </a>
            <button
              type="button"
              onClick={() =>
                window.open(createdClient.loginUrl, "_blank", "noopener")
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
