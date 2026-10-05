import { ExternalLink, Upload } from "lucide-react";
import { useState } from "react";

import API from "../../api/axios";
import {
  governmentIndustries,
  statutoryDocuments,
} from "../../data/onboardingFlow";

export default function CreateCompany() {
  const [form, setForm] = useState({
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
  });
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
  const [loading, setLoading] = useState(false);
  const [createdCompany, setCreatedCompany] = useState(null);

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

      const res = await API.post("/company/create", payload);

      setCreatedCompany({
        name: res.data.company.name,
        loginUrl: res.data.loginUrl,
        loginName: res.data.loginName || res.data.company?.email || "",
      });

      setForm({
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
      });
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
      console.error("Create company failed:", error?.response || error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create company";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Company/Branch</h1>
        <p className="mt-2 text-[#18206F]/60 text-lg">
          Onboarding a company/branch under your client portal and generating
          its login URL.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 text-md md:grid-cols-2"
      >
        <input
          name="companyName"
          type="text"
          placeholder="Company/Branch Name"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.companyName}
          onChange={handleChange}
          required
        />

        <input
          name="branchCode"
          type="text"
          placeholder="Branch Code"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.branchCode}
          onChange={handleChange}
        />

        <input
          name="companyNameAsPerGstCertificate"
          type="text"
          placeholder="Company/Branch Name as per GST Certificate"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.companyNameAsPerGstCertificate}
          onChange={handleChange}
          required
        />

        <input
          name="name"
          type="text"
          placeholder="Company/Branch Admin Name"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Company/Branch Admin Email"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="seDetails"
          type="text"
          placeholder="S&E Details"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.seDetails}
          onChange={handleChange}
          required
        />

        <input
          name="natureOfWork"
          type="text"
          placeholder="Nature of Work"
          className="w-full rounded-lg bg-[#18206F]/5 p-3 outline-none"
          value={form.natureOfWork}
          onChange={handleChange}
          required
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
