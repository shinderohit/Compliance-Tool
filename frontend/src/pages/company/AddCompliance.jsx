import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  INDIA_STATES_AND_UTS,
  REGISTRATION_DOCUMENTS,
} from "../../data/indiaLocations";

const emptyRegistration = {
  number: "",
  applicableDate: "",
  expiryDate: "",
};

const emptyBranch = {
  name: "",
  state: "",
  location: "",
  address: "",
};

const emptyForm = {
  uin: "",
  companyName: "",
  state: "",
  location: "",
  lawArea: "",
  actRule: "",
  complianceName: "",
  complianceType: "",
  complianceScore: "",
  gstNumber: "",
  panNumber: "",
  status: "Pending",
  applicableDate: "",
  expiryDate: "",
  riskLevel: "Low",
  assignedTo: "",
  department: "",
  priority: "",
  frequency: "",
  remarks: "",
};

const buildRegistrations = () =>
  REGISTRATION_DOCUMENTS.reduce(
    (acc, item) => ({
      ...acc,
      [item.key]: { ...emptyRegistration },
    }),
    {},
  );

const toDateInputValue = (value) => {
  if (!value) return "";

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + value);
    return excelEpoch.toISOString().slice(0, 10);
  }

  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
};

export default function AddCompliance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzerFile, setAnalyzerFile] = useState(null);
  const [analyzerMessage, setAnalyzerMessage] = useState("");
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [extractedRows, setExtractedRows] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [registrations, setRegistrations] = useState(buildRegistrations);
  const [documents, setDocuments] = useState({});
  const [branches, setBranches] = useState([{ ...emptyBranch }]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await API.get("/master/states");
        setStates(res.data?.length ? res.data : INDIA_STATES_AND_UTS);
      } catch (error) {
        console.log(error);
        setStates(INDIA_STATES_AND_UTS);
      }
    };

    fetchStates();
  }, []);

  const stateOptions = states.length ? states : INDIA_STATES_AND_UTS;

  const fallbackLocations = useMemo(() => {
    return (
      INDIA_STATES_AND_UTS.find((item) => item.name === formData.state)
        ?.locations || []
    );
  }, [formData.state]);

  const locationOptions = locations.length
    ? locations.map((item) => item.name || item)
    : fallbackLocations;

  const inputClass =
    "w-full rounded-lg border border-[#CBCBD4] bg-white p-3 text-[#18206F] focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStateChange = async (e) => {
    const stateName = e.target.value;
    const selectedState = stateOptions.find((item) => item.name === stateName);

    setFormData((prev) => ({
      ...prev,
      state: stateName,
      location: "",
    }));
    setLocations([]);

    if (!selectedState?.id) return;

    try {
      const res = await API.get(`/master/locations/${selectedState.id}`);
      setLocations(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegistrationChange = (key, field, value) => {
    setRegistrations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));

    if (key === "gst" && field === "number") {
      setFormData((prev) => ({ ...prev, gstNumber: value }));
    }
  };

  const handleBranchChange = (index, field, value) => {
    setBranches((prev) =>
      prev.map((branch, branchIndex) =>
        branchIndex === index ? { ...branch, [field]: value } : branch,
      ),
    );
  };

  const applyAnalyzedRow = (row, result) => {
    const nextForm = {
      ...emptyForm,
      uin: row.uin || "",
      companyName: row.companyName || "",
      state: row.state || "",
      location: row.location || "",
      lawArea: row.lawArea || "",
      actRule: row.actRule || "",
      complianceName: row.compliance || row.complianceName || "",
      complianceType: row.complianceType || "",
      complianceScore: result?.complianceScore ?? "",
      panNumber: row.panNumber || "",
      gstNumber: row.gstNumber || "",
      status: row.status || "Pending",
      applicableDate: toDateInputValue(row.applicableDate),
      expiryDate: toDateInputValue(row.expiryDate),
      riskLevel: result?.riskLevel || row.riskLevel || "Low",
      assignedTo: row.assignedTo || "",
      department: row.department || "",
      priority: row.priority || "",
      frequency: row.frequency || "",
      remarks: row.remarks || "",
    };

    const nextRegistrations = buildRegistrations();

    REGISTRATION_DOCUMENTS.forEach((item) => {
      const prefix = item.key;
      const analyzedRegistration = result?.registrations?.[prefix] || {};
      nextRegistrations[prefix] = {
        number:
          analyzedRegistration.number ||
          row[`${prefix}Number`] ||
          (prefix === "gst" ? row.gstNumber : "") ||
          "",
        applicableDate: toDateInputValue(
          analyzedRegistration.applicableDate ||
            row[`${prefix}ApplicableDate`] ||
            row.applicableDate,
        ),
        expiryDate: toDateInputValue(
          analyzedRegistration.expiryDate ||
            row[`${prefix}ExpiryDate`] ||
            row.expiryDate,
        ),
      };
    });

    setFormData(nextForm);
    setRegistrations(nextRegistrations);
    setBranches(
      Array.isArray(result?.branches) && result.branches.length
        ? result.branches.map((branch) => ({
            name: branch.name || "",
            state: branch.state || "",
            location: branch.location || "",
            address: branch.address || "",
          }))
        : [{ ...emptyBranch }],
    );
    setLocations([]);
  };

  const handleAnalyzeDocument = async () => {
    if (!analyzerFile) {
      setAnalyzerMessage(
        "Please choose a PDF, Word, image, Excel, or CSV document to analyze.",
      );
      return;
    }

    const payload = new FormData();
    payload.append("file", analyzerFile);

    try {
      setAnalyzing(true);
      setAnalyzerMessage("");
      setAnalyzerResult(null);
      setExtractedRows([]);

      const response = await API.post("/compliance/analyze", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data?.data;
      const rows = Array.isArray(result?.extractedData)
        ? result.extractedData
        : [];
      const row = rows[0];

      if (!row) {
        setAnalyzerMessage("No compliance data found in this file.");
        return;
      }

      applyAnalyzedRow(row, result);
      setDocuments((prev) => ({
        ...prev,
        source: analyzerFile,
      }));
      setAnalyzerResult(result);
      setExtractedRows(rows);
      setAnalyzerMessage(
        `${result.analyzer || "AI"} analysis completed. ${rows.length} row${
          rows.length === 1 ? "" : "s"
        } extracted. Review the preview, then add all records to Compliance Master.`,
      );
    } catch (error) {
      console.log(error);
      setAnalyzerMessage(
        error?.response?.data?.message || "AI document analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddExtractedRows = async () => {
    if (extractedRows.length === 0) {
      setAnalyzerMessage("No extracted rows available to add.");
      return;
    }

    try {
      setBulkSaving(true);

      const response = await API.post("/compliance/master/bulk", {
        rows: extractedRows,
        complianceScore: analyzerResult?.complianceScore,
        riskLevel: analyzerResult?.riskLevel,
        branches: analyzerResult?.branches || [],
      });

      alert(
        response.data?.message ||
          `${extractedRows.length} compliance records added successfully`,
      );
      resetForm();
      setAnalyzerFile(null);
      setAnalyzerResult(null);
      setExtractedRows([]);
      navigate("/company/compliance-master");
    } catch (error) {
      console.log(error);
      alert(
        error?.response?.data?.message ||
          "Failed to add extracted compliance records",
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setRegistrations(buildRegistrations());
    setDocuments({});
    setBranches([{ ...emptyBranch }]);
    setLocations([]);
    setExtractedRows([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shouldOpenMaster = e.nativeEvent.submitter?.value === "save-and-view";

    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value || "");
    });
    payload.append("registrations", JSON.stringify(registrations));
    payload.append(
      "branches",
      JSON.stringify(
        branches.filter((branch) => branch.name || branch.address),
      ),
    );

    Object.entries(documents).forEach(([key, file]) => {
      if (file) payload.append(`${key}Document`, file);
    });

    try {
      setLoading(true);
      await API.post("/compliance/master", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Compliance Added Successfully");
      resetForm();
      if (shouldOpenMaster) {
        navigate("/company/compliance-master");
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to add compliance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Compliance</h1>
        <p className="text-[#18206F]/60 mt-2 text-lg">
          Onboarding compliance records with registration documents and
          branches.
        </p>
      </div>

      <div className="rounded-xl border border-[#CBCBD4] bg-white p-6">
        <section className="mb-8 rounded-lg border border-[#CBCBD4] p-5">
          <h2 className="text-xl font-semibold mb-4">AI Document Analyser</h2>
          <p className="mb-4 text-sm text-[#18206F]/60">
            Scan a registration certificate, notice, licence, PDF, Word file,
            image, or spreadsheet to auto-fill the compliance form.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 text-md">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
              onChange={(e) => setAnalyzerFile(e.target.files?.[0] || null)}
              className={inputClass}
            />

            <button
              type="button"
              onClick={handleAnalyzeDocument}
              disabled={analyzing}
              className="rounded-lg bg-[#18206F] text-md px-3 py-1 font-semibold text-white hover:bg-[#18206F]/85 disabled:opacity-60"
            >
              {analyzing ? "Analyzing..." : "Analyze & Fill"}
            </button>
          </div>

          {analyzerMessage && (
            <p className="mt-3 text-sm text-[#18206F]/70">{analyzerMessage}</p>
          )}

          {analyzerResult && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#18206F]/5 p-4">
                <p className="text-sm text-[#18206F]/60">
                  {analyzerResult.analyzer || "AI"} result
                </p>
                <p className="mt-1 font-semibold">{analyzerResult.title}</p>
              </div>
              <div className="rounded-lg bg-[#18206F]/5 p-4">
                <p className="text-sm text-[#18206F]/60">Score</p>
                <p className="mt-1 font-semibold">
                  {analyzerResult.complianceScore ?? "-"}%
                </p>
              </div>
              <div className="rounded-lg bg-[#18206F]/5 p-4">
                <p className="text-sm text-[#18206F]/60">Risk</p>
                <p className="mt-1 font-semibold">
                  {analyzerResult.riskLevel || "-"}
                </p>
              </div>
            </div>
          )}

          {analyzerResult?.summary && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="font-semibold text-[#18206F]">AI summary</p>
              <p className="mt-1 text-sm text-[#18206F]/75">
                {analyzerResult.summary}
              </p>
            </div>
          )}

          {(analyzerResult?.issues?.length > 0 ||
            analyzerResult?.recommendations?.length > 0) && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="font-semibold text-red-700">Detected issues</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                  {(analyzerResult.issues || []).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="font-semibold text-green-700">Recommendations</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-green-700">
                  {(analyzerResult.recommendations || []).map(
                    (recommendation) => (
                      <li key={recommendation}>{recommendation}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          )}

          {extractedRows.length > 0 && (
            <div className="mt-5 rounded-lg border border-[#CBCBD4] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#CBCBD4] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[#18206F]">
                    Extracted compliance rows
                  </p>
                  <p className="text-sm text-[#18206F]/60">
                    Review the extracted rows before adding them to Compliance
                    Master.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddExtractedRows}
                  disabled={bulkSaving}
                  className="rounded-lg bg-[#18206F] px-4 py-2 font-semibold text-white hover:bg-[#18206F]/85 disabled:opacity-60"
                >
                  {bulkSaving
                    ? "Adding..."
                    : `Add ${extractedRows.length} to Compliance Master`}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-[#18206F]/5 text-[#18206F]/70">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Company/Branch</th>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">Law Area</th>
                      <th className="px-3 py-2">Compliance</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedRows.map((row, index) => (
                      <tr
                        key={`${row.uin || row.compliance || "row"}-${index}`}
                        className="border-t border-[#CBCBD4]"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{row.companyName || "-"}</td>
                        <td className="px-3 py-2">{row.state || "-"}</td>
                        <td className="px-3 py-2">{row.location || "-"}</td>
                        <td className="px-3 py-2">{row.lawArea || "-"}</td>
                        <td className="px-3 py-2">
                          {row.compliance || row.complianceName || "-"}
                        </td>
                        <td className="px-3 py-2">
                          {row.complianceType || "-"}
                        </td>
                        <td className="px-3 py-2">{row.status || "Pending"}</td>
                        <td className="px-3 py-2">
                          {toDateInputValue(row.expiryDate) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-8 text-md">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <input
              type="number"
              name="uin"
              placeholder="UIN"
              value={formData.uin}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="companyName"
              placeholder="Company/Branch Name"
              required
            />

            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              className={inputClass}
            >
              <option value="">Select State</option>
              {stateOptions.map((state) => (
                <option key={state.id || state.name} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={inputClass}
              disabled={!formData.state}
            >
              <option value="">Select Location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="panNumber"
              placeholder="PAN Number"
              value={formData.panNumber}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="lawArea"
              placeholder="Law Area"
              value={formData.lawArea}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="actRule"
              placeholder="Act / Rule"
              value={formData.actRule}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="complianceName"
              placeholder="Compliance Name"
              value={formData.complianceName}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="complianceType"
              placeholder="Compliance Type"
              value={formData.complianceType}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="number"
              name="complianceScore"
              placeholder="AI Compliance Score"
              value={formData.complianceScore}
              onChange={handleChange}
              className={inputClass}
              min="0"
              max="100"
            />
            <input
              type="date"
              name="applicableDate"
              value={formData.applicableDate}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={inputClass}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option>Pending</option>
              <option>Complied</option>
              <option>Overdue</option>
              <option>Pending Approval</option>
              <option>Rejected</option>
              <option>Not Applicable</option>
              <option>One Time</option>
            </select>

            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              className={inputClass}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="text"
              name="assignedTo"
              placeholder="Assigned To"
              value={formData.assignedTo}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="priority"
              placeholder="Priority"
              value={formData.priority}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="frequency"
              placeholder="Frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={inputClass}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              Registration Documents
            </h2>
            <div className="space-y-4">
              {REGISTRATION_DOCUMENTS.map((item) => (
                <div
                  key={item.key}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border border-[#CBCBD4] p-4"
                >
                  <input
                    type="text"
                    placeholder={`${item.label} Number`}
                    value={registrations[item.key].number}
                    onChange={(e) =>
                      handleRegistrationChange(
                        item.key,
                        "number",
                        e.target.value,
                      )
                    }
                    className={inputClass}
                  />
                  <input
                    type="date"
                    aria-label={`${item.label} Applicable Date`}
                    value={registrations[item.key].applicableDate}
                    onChange={(e) =>
                      handleRegistrationChange(
                        item.key,
                        "applicableDate",
                        e.target.value,
                      )
                    }
                    className={inputClass}
                  />
                  <input
                    type="date"
                    aria-label={`${item.label} Expire Date`}
                    value={registrations[item.key].expiryDate}
                    onChange={(e) =>
                      handleRegistrationChange(
                        item.key,
                        "expiryDate",
                        e.target.value,
                      )
                    }
                    className={inputClass}
                  />
                  <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#18206F]/40 p-3 text-sm font-semibold text-[#18206F]">
                    {documents[item.key]
                      ? documents[item.key].name
                      : `Upload ${item.label}`}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setDocuments((prev) => ({
                          ...prev,
                          [item.key]: e.target.files?.[0],
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Branches</h2>
              <button
                type="button"
                onClick={() =>
                  setBranches((prev) => [...prev, { ...emptyBranch }])
                }
                className="rounded-lg border border-[#18206F] px-4 py-2 font-semibold text-[#18206F]"
              >
                Add Branch
              </button>
            </div>

            <div className="space-y-4">
              {branches.map((branch, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border border-[#CBCBD4] p-4"
                >
                  <input
                    type="text"
                    placeholder="Branch Name"
                    value={branch.name}
                    onChange={(e) =>
                      handleBranchChange(index, "name", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Branch State"
                    value={branch.state}
                    onChange={(e) =>
                      handleBranchChange(index, "state", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Branch Location"
                    value={branch.location}
                    onChange={(e) =>
                      handleBranchChange(index, "location", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Branch Address"
                    value={branch.address}
                    onChange={(e) =>
                      handleBranchChange(index, "address", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          <textarea
            name="remarks"
            placeholder="Remarks"
            rows="4"
            value={formData.remarks}
            onChange={handleChange}
            className={inputClass}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              value="save"
              disabled={loading}
              className="border border-[#18206F] text-[#18206F] hover:bg-[#18206F]/5 px-8 py-3 rounded-lg font-semibold"
            >
              {loading ? "Saving..." : "Save Compliance"}
            </button>
            <button
              type="submit"
              value="save-and-view"
              disabled={loading}
              className="bg-[#18206F] text-white hover:bg-[#18206F]/85 px-8 py-3 rounded-lg font-semibold"
            >
              {loading ? "Saving..." : "Save & View Compliance Master"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
