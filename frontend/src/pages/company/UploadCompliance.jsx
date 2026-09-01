import { useState, useEffect } from "react";
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

const buildRegistrations = () =>
  REGISTRATION_DOCUMENTS.reduce(
    (acc, item) => ({
      ...acc,
      [item.key]: { ...emptyRegistration },
    }),
    {},
  );

export default function UploadCompliance() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lawAreas, setLawAreas] = useState([]);
  const [actRules, setActRules] = useState([]);
  const [compliances, setCompliances] = useState([]);
  const [registrations, setRegistrations] = useState(buildRegistrations);
  const [documents, setDocuments] = useState({});
  const [branches, setBranches] = useState([{ ...emptyBranch }]);

  const [formData, setFormData] = useState({
    uin: "",
    companyName: "",
    state: "",
    location: "",
    gstNumber: "",
    panNumber: "",
    lawArea: "",
    actRule: "",
    compliance: "",
    complianceType: "",
    dueDate: "",
    expiryDate: "",
    complianceScore: "",
    riskLevel: "",
    status: "",
    assignedTo: "",
    department: "",
    priority: "",
    frequency: "",
    remarks: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose an Excel or CSV file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      setUploadResult(null);

      const response = await API.post("/compliance/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data.data;

      setUploadResult(result);

      if (result?.extractedData?.length > 0) {
        const row = result.extractedData[0];

        setFormData({
          uin: row.uin || "",
          companyName: row.companyName || "",
          state: row.state || "",
          location: row.location || "",
          gstNumber: row.gstNumber || "",
          panNumber: row.panNumber || "",
          lawArea: row.lawArea || "",
          actRule: row.actRule || "",
          compliance: row.compliance || "",
          complianceType: row.complianceType || "",
          dueDate: row.dueDate || "",
          expiryDate: row.expiryDate || "",
          complianceScore: result.complianceScore || "",
          riskLevel: result.riskLevel || "",
          status: row.status || "",
          assignedTo: row.assignedTo || "",
          department: row.department || "",
          priority: row.priority || "",
          frequency: row.frequency || "",
          remarks: row.remarks || "",
        });

        setRegistrations((prev) => ({
          ...prev,
          gst: {
            ...prev.gst,
            number: row.gstNumber || "",
            expiryDate: row.expiryDate || "",
          },
        }));
      }

      setMessage(response.data.message || "File uploaded successfully.");
    } catch (error) {
      console.log(error);

      setMessage(error?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompliance = async (e) => {
    e.preventDefault();

    try {
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

      const res = await API.post("/compliance/manual", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Compliance added successfully");

      console.log(res.data);

      setFormData({
        uin: "",
        companyName: "",
        state: "",
        location: "",
        gstNumber: "",
        panNumber: "",
        lawArea: "",
        actRule: "",
        compliance: "",
        complianceType: "",
        dueDate: "",
        expiryDate: "",
        complianceScore: "",
        riskLevel: "Low",
        status: "",
        assignedTo: "",
        department: "",
        priority: "",
        frequency: "",
        remarks: "",
      });
      setRegistrations(buildRegistrations());
      setDocuments({});
      setBranches([{ ...emptyBranch }]);
    } catch (error) {
      console.log(error);

      alert("Failed to save compliance");
    }
  };

  const fetchMasters = async () => {
    try {
      const [stateRes, lawRes] = await Promise.all([
        API.get("/master/states"),
        API.get("/master/law-areas"),
      ]);

      setStates(stateRes.data?.length ? stateRes.data : INDIA_STATES_AND_UTS);
      setLawAreas(lawRes.data || []);
    } catch (error) {
      console.log(error);
      setStates(INDIA_STATES_AND_UTS);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  const inputClass =
    "w-full bg-white border border-[#CBCBD4] rounded-xl p-3 text-[#18206F] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const handleRegistrationChange = (key, field, value) => {
    setRegistrations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));

    if (key === "gst" && field === "number") {
      setFormData((prev) => ({
        ...prev,
        gstNumber: value,
      }));
    }
  };

  const handleBranchChange = (index, field, value) => {
    setBranches((prev) =>
      prev.map((branch, branchIndex) =>
        branchIndex === index ? { ...branch, [field]: value } : branch,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">Add Compliance</h1>

        <p className="text-[#18206F]/60 mt-2">
          Upload Excel/CSV files or add compliance records manually.
        </p>
      </div>

      {/* Upload Form */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#CBCBD4] bg-white p-6"
      >
        <h2 className="text-2xl font-bold mb-4">AI Smart Document Analyzer</h2>

        <div className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full rounded border border-[#CBCBD4] bg-white p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#18206F] text-white hover:bg-[#18206F]/85 px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>

          {message && <p className="text-sm text-[#18206F]/70">{message}</p>}
        </div>
      </form>

      {/* Upload Summary */}

      {uploadResult && (
        <div className="rounded-2xl border border-[#CBCBD4] bg-white p-6">
          <h2 className="text-2xl font-bold mb-4">Upload Summary</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-[#18206F]/60 text-sm">File Name</p>

              <p className="font-semibold mt-2">{uploadResult.title}</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-[#18206F]/60 text-sm">Compliance Score</p>

              <p className="font-semibold mt-2">
                {uploadResult.complianceScore}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-[#18206F]/60 text-sm">Risk Level</p>

              <p className="font-semibold mt-2">{uploadResult.riskLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Table */}

      {uploadResult?.extractedData?.length > 0 && (
        <div className="rounded-2xl border border-[#CBCBD4] bg-white p-6">
          <h2 className="text-2xl font-bold mb-4">Extracted Compliance Data</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#18206F]/5">
                <tr>
                  <th className="p-3 text-left">Company/Branch</th>
                  <th className="p-3 text-left">GST</th>
                  <th className="p-3 text-left">PAN</th>
                  <th className="p-3 text-left">Compliance</th>
                  <th className="p-3 text-left">Expiry</th>
                </tr>
              </thead>

              <tbody>
                {uploadResult.extractedData.map((row, index) => (
                  <tr key={index} className="border-t border-[#CBCBD4]">
                    <td className="p-3">{row.companyName || "-"}</td>

                    <td className="p-3">{row.gstNumber || "-"}</td>

                    <td className="p-3">{row.panNumber || "-"}</td>

                    <td className="p-3">{row.complianceType || "-"}</td>

                    <td className="p-3">{row.expiryDate || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Compliance Form */}

      <div className="rounded-2xl border border-[#CBCBD4] bg-white p-6">
        <h2 className="text-2xl font-bold mb-6">Add Compliance Manually</h2>

        <form
          onSubmit={handleAddCompliance}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <input
            type="text"
            name="uin"
            placeholder="UIN"
            value={formData.uin}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <input
            type="text"
            name="companyName"
            placeholder="Company/Branch Name"
            value={formData.companyName}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <select
            name="state"
            value={formData.state || ""}
            onChange={async (e) => {
              const stateName = e.target.value;
              const selectedState = states.find(
                (state) => state.name === stateName,
              );

              setFormData({
                ...formData,
                state: stateName,
                location: "",
              });
              setLocations([]);

              if (!selectedState?.id) {
                setLocations(
                  INDIA_STATES_AND_UTS.find(
                    (item) => item.name === stateName,
                  )?.locations.map((name) => ({ id: name, name })) || [],
                );
                return;
              }

              try {
                const res = await API.get(
                  `/master/locations/${selectedState.id}`,
                );
                setLocations(res.data);
              } catch (error) {
                console.log(error);
              }
            }}
            className={inputClass}
          >
            <option value="">Select State</option>

            {states.map((state) => (
              <option key={state.id || state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>

          <select
            name="location"
            value={formData.location || ""}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Location</option>

            {locations.map((location) => (
              <option key={location.id || location.name} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="panNumber"
            placeholder="PAN Number"
            value={formData.panNumber}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <select
            name="lawAreaId"
            value={formData.lawAreaId || ""}
            onChange={async (e) => {
              const lawAreaId = e.target.value;

              setFormData({
                ...formData,
                lawAreaId,
                actRuleId: "",
                complianceId: "",
              });

              try {
                const res = await API.get(`/master/act-rules/${lawAreaId}`);
                setActRules(res.data);
              } catch (error) {
                console.log(error);
              }
            }}
            className={inputClass}
          >
            <option value="">Select Law Area</option>

            {lawAreas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="actRuleId"
            value={formData.actRuleId || ""}
            onChange={async (e) => {
              const actRuleId = e.target.value;

              setFormData({
                ...formData,
                actRuleId,
                complianceId: "",
              });

              try {
                const res = await API.get(`/master/compliances/${actRuleId}`);
                setCompliances(res.data);
              } catch (error) {
                console.log(error);
              }
            }}
            className={inputClass}
          >
            <option value="">Select Act / Rule</option>

            {actRules.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="complianceId"
            value={formData.complianceId || ""}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Compliance</option>

            {compliances.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            name="riskLevel"
            value={formData.riskLevel}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Risk</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="text"
            name="assignedTo"
            placeholder="Assigned To"
            value={formData.assignedTo}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            className="bg-white border border-[#CBCBD4] rounded-lg p-3"
          >
            <option value="">Frequency</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Half Yearly</option>
            <option>Yearly</option>
            <option>One Time</option>
          </select>

          <textarea
            name="remarks"
            placeholder="Remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="md:col-span-3 bg-white border border-[#CBCBD4] rounded-lg p-3"
            rows={4}
          />

          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-bold mb-4">Registration Documents</h3>

            <div className="space-y-4">
              {REGISTRATION_DOCUMENTS.map((item) => (
                <div
                  key={item.key}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl border border-[#CBCBD4] p-4"
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

                  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#18206F]/40 p-3 text-sm font-semibold text-[#18206F]">
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
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold">Branches</h3>

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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-[#CBCBD4] p-4"
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
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full bg-[#18206F] text-white hover:bg-[#18206F]/85 py-4 rounded-xl font-semibold text-lg transition"
            >
              Save Compliance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
