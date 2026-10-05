import { ExternalLink, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api/axios";
import logo from "../../assets/Logo.png";
import {
  governmentIndustries,
  statutoryDocuments,
} from "../../data/onboardingFlow";

const initialForm = {
  clientId: "",
  companyName: "",
  companyNameAsPerGstCertificate: "",
  name: "",
  email: "",
  seDetails: "",
  natureOfWork: "",
  industryId: "",
  appropriateGovernment: "",
  branchCode: "",
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

export default function CreateCompany() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    companyLogo: null,
    panCertificate: null,
    gstCertificate: null,
    seCertificate: null,
    pfCertificate: null,
    esicCertificate: null,
    ptCertificate: null,
    lwfCertificate: null,
    bulkUpload: null,
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdCompany, setCreatedCompany] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const endpoint = isSuperAdmin ? "/super-admin/clients" : "/kao/clients";
        const res = await API.get(endpoint, { params: { limit: 100 } });
        setClients(res.data.clients || res.data.data || []);
      } catch (error) {
        console.error("Failed to load clients", error);
      }
    };

    fetchClients();
  }, [isSuperAdmin]);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFileChange = (event) => {
    setFiles((prev) => ({
      ...prev,
      [event.target.name]: event.target.files?.[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setCreatedCompany(null);

      const payload = new FormData();
      payload.append("clientId", form.clientId);
      payload.append("companyName", form.companyName);
      payload.append(
        "companyNameAsPerGstCertificate",
        form.companyNameAsPerGstCertificate,
      );
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("seDetails", form.seDetails);
      payload.append("natureOfWork", form.natureOfWork);
      payload.append("industryId", form.industryId);
      payload.append("appropriateGovernment", form.appropriateGovernment);
      payload.append("branchCode", form.branchCode);
      payload.append("state", form.state);
      payload.append("city", form.city);
      payload.append("location", form.location);
      payload.append("pincode", form.pincode);
      payload.append("panNumber", form.panNumber);
      payload.append("gstNumber", form.gstNumber);
      payload.append("pfNumber", form.pfNumber);
      payload.append("esicNumber", form.esicNumber);
      payload.append("ptNumber", form.ptNumber);
      payload.append("lwfNumber", form.lwfNumber);
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      const endpoint = isSuperAdmin
        ? "/super-admin/create-company"
        : "/kao/create-company";
      const res = await API.post(endpoint, payload);

      setCreatedCompany({
        name: res.data.company.name,
        loginUrl: res.data.loginUrl,
        loginName: res.data.loginName || res.data.company?.email || "",
      });

      setForm(initialForm);
      setFiles({
        companyLogo: null,
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
    } catch (error) {
      console.error("Onboard company failed:", error?.response || error);
      alert(error?.response?.data?.message || "Failed to onboard company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Company/Branch</h1>
          <p className="mt-2 text-[#18206F]/60 text-lg">
            Onboarding a company/branch for one of your clients and generating
            its login URL.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 text-md md:grid-cols-2"
      >
        <select
          name="clientId"
          value={form.clientId}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <input
          name="companyName"
          placeholder="Company/Branch Name"
          value={form.companyName}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="branchCode"
          placeholder="Branch Code"
          value={form.branchCode}
          onChange={handleChange}
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="companyNameAsPerGstCertificate"
          placeholder="Company/Branch Name as per GST Certificate"
          value={form.companyNameAsPerGstCertificate}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="name"
          placeholder="Company/Branch Admin Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        <input
          name="email"
          type="email"
          placeholder="Company/Branch Admin Email"
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
          {(governmentIndustries[form.appropriateGovernment] || []).map(
            (industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ),
          )}
        </select>

        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="city"
          placeholder="City / District"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="pincode"
          placeholder="Pin-code"
          value={form.pincode}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="panNumber"
          placeholder="PAN Number"
          value={form.panNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="gstNumber"
          placeholder="GST Number"
          value={form.gstNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="pfNumber"
          placeholder="PF Number"
          value={form.pfNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="esicNumber"
          placeholder="ESIC Number"
          value={form.esicNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="ptNumber"
          placeholder="PT Number"
          value={form.ptNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="lwfNumber"
          placeholder="LWF Number"
          value={form.lwfNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />

        {statutoryDocuments.map(([name, label]) => (
          <label
            key={name}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70"
          >
            <Upload size={18} />
            <span className="min-w-0 flex-1 truncate">
              {files[name]?.name || label}
            </span>
            <input
              name={name}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
              className="sr-only"
            />
          </label>
        ))}

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70 md:col-span-2">
          <Upload size={18} />
          <span className="min-w-0 flex-1 truncate">
            {files.companyLogo?.name || "Upload Company Logo (optional)"}
          </span>
          <input
            name="companyLogo"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70 md:col-span-2">
          <Upload size={18} />
          <span className="min-w-0 flex-1 truncate">
            {files.bulkUpload?.name || "Upload Excel / CSV for bulk onboarding"}
          </span>
          <input
            name="bulkUpload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <button
          disabled={loading}
          className="md:col-span-2 w-full rounded-lg bg-[#18206F] text-white p-3 font-bold transition hover:bg-[#18206F]/85 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Onboarding..." : "Onboarding Company/Branch"}
        </button>
      </form>

      {createdCompany && (
        <div className="rounded-lg border border-green-700 bg-green-950/40 p-5">
          <p className="font-semibold text-green-700">
            {createdCompany.name} created successfully
          </p>

          <div className="mt-3 space-y-3">
            <p className="text-sm text-green-100">
              <span className="font-semibold">Login Name:</span>{" "}
              {createdCompany.loginName}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={createdCompany.loginUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-700"
              >
                {createdCompany.loginUrl}
                <ExternalLink size={16} />
              </a>
              <button
                type="button"
                onClick={() =>
                  window.open(createdCompany.loginUrl, "_blank", "noopener")
                }
                className="rounded-lg bg-[#18206F]/5 px-4 py-2 text-sm text-[#18206F] transition hover:bg-[#D4AF37]/15"
              >
                Open Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
