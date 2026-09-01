import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useRef } from "react";
import {
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import DashboardAnalytics from "../../components/dashboard/DashboardAnalytics";
import DashboardWidgets from "../../components/dashboard/DashboardWidgets";
import API from "../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    company: null,
    stats: {
      totalUploads: 0,
      complianceScore: 0,
      aiSuggestions: 0,
      riskLevel: "N/A",
    },
    uploads: [],
  });

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [widgets, setWidgets] = useState({});
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [now] = useState(() => Date.now());

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      API.get("/company/dashboard"),
      API.get("/compliance/analytics"),
      API.get("/company/dashboard/widgets"),
    ])
      .then(([dashboardRes, analyticsRes, widgetRes]) => {
        if (!isMounted) return;

        setDashboard({
          company: dashboardRes.data.company,
          stats: dashboardRes.data.stats,
          uploads: dashboardRes.data.uploads,
        });

        setAnalytics(analyticsRes.data);
        setWidgets(widgetRes.data?.widgets || {});
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

  const filteredUploads = useMemo(() => {
    return dashboard.uploads.filter((item) => {
      const searchMatch = item.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const riskMatch =
        riskFilter === "ALL" ? true : item.riskLevel === riskFilter;

      return searchMatch && riskMatch;
    });
  }, [dashboard.uploads, search, riskFilter]);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUploads);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Report");

    XLSX.writeFile(workbook, "Compliance_Report.xlsx");
  };

  const notifications = useMemo(() => {
    return dashboard.uploads.slice(0, 5).map((upload) => {
      let title = `New compliance file uploaded: ${upload.title}`;

      if (upload.riskLevel === "High") {
        title = `High risk flagged on ${upload.title}`;
      } else if ((upload.complianceScore || 0) >= 80) {
        title = `${upload.title} approved with ${upload.complianceScore}% score`;
      }

      return {
        title,
        time: (() => {
          const diffMs = now - new Date(upload.createdAt).getTime();
          const minutes = Math.floor(diffMs / 60000);
          if (minutes < 1) return "Just now";
          if (minutes < 60)
            return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
          const hours = Math.floor(minutes / 60);
          if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
          const days = Math.floor(hours / 24);
          if (days === 1) return "Yesterday";
          return `${days} days ago`;
        })(),
      };
    });
  }, [dashboard.uploads, now]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
      const res = await API.post("/compliance/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("File uploaded successfully");

      console.log(res.data);
    } catch (error) {
      console.error(error);

      alert("Upload failed");
    }
  };

  const recommendations = useMemo(() => {
    const allIssues = dashboard.uploads.flatMap(
      (upload) => upload.issues || [],
    );

    if (allIssues.length === 0) {
      return ["No outstanding recommendations. All uploads look healthy."];
    }

    return allIssues.slice(0, 6);
  }, [dashboard.uploads]);

  const expiryAlerts = useMemo(() => {
    return dashboard.uploads
      .filter((upload) =>
        upload.issues?.some((issue) => issue.toLowerCase().includes("expir")),
      )
      .map((upload) => {
        const expiryIssue = upload.issues.find((issue) =>
          issue.toLowerCase().includes("expir"),
        );

        const passed = expiryIssue?.toLowerCase().includes("passed");

        return {
          document: upload.title,
          expiry: new Date(upload.createdAt).toLocaleDateString(),
          status: passed ? "Expired" : "Expiring Soon",
        };
      })
      .slice(0, 5);
  }, [dashboard.uploads]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold">
            {dashboard.company?.name || "Company/Branch Dashboard"}
          </h1>

          <p className="mt-2 text-lg text-[#18206F]/60">
            Review uploaded compliance items and risk status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-[#18206F] text-white hover:bg-[#18206F]/85 px-2 py-1 rounded-lg text-sm font-semibold"
          >
            <FaFileExcel />
            Upload Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={handleFileUpload}
          />

          <button
            onClick={exportExcel}
            className="bg-[#18206F] text-white hover:bg-[#18206F]/85 px-2 py-1 rounded-lg text-sm font-semibold"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <AnalyticsCard
          title="Total Compliance"
          value={analytics?.totalCompliances || 0}
        />

        <AnalyticsCard title="Pending" value={analytics?.pending || 0} />

        <AnalyticsCard title="Completed" value={analytics?.completed || 0} />

        <AnalyticsCard title="Overdue" value={analytics?.overdue || 0} />

        <AnalyticsCard
          title="Average Score"
          value={`${analytics?.averageScore || 0}%`}
        />

        <AnalyticsCard title="High Risk" value={analytics?.highRisk || 0} />

        <AnalyticsCard title="Medium Risk" value={analytics?.mediumRisk || 0} />

        <AnalyticsCard title="Low Risk" value={analytics?.lowRisk || 0} />
      </div> */}

      <DashboardAnalytics
        role="company"
        dashboard={dashboard}
        analytics={analytics || {}}
      />

      <DashboardWidgets widgets={widgets} />

      {/* NOTIFICATIONS + AI */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl px-4 py-2 border border-[#CBCBD4]">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>

          {notifications.map((item, index) => (
            <div key={index} className="border-b border-[#CBCBD4] py-1">
              <p className="text-md">{item.title}</p>
              <span className="text-sm text-[#18206F]/60">{item.time}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl px-4 py-2 border border-[#CBCBD4]">
          <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>

          <ul className="space-y-2">
            {recommendations.map((item, index) => (
              <li className="text-sm" key={index}>
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* EXPIRY ALERTS */}
      <div className="bg-white rounded-xl px-4 py-2 border border-[#CBCBD4]">
        <h2 className="text-xl font-bold mb-4">Upcoming Expiry Alerts</h2>

        {expiryAlerts.length === 0 ? (
          <p className="text-[#18206F]/60 text-sm">
            No expiry issues detected in your recent uploads.
          </p>
        ) : (
          <table className="w-full text-left text-md">
            <thead>
              <tr>
                <th className="text-left py-2">Document</th>
                <th className="text-left py-2">Expiry Date</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {expiryAlerts.map((item, index) => (
                <tr key={index}>
                  <td className="text-md py-2">{item.document}</td>
                  <td className="text-md">{item.expiry}</td>
                  <td className="text-md text-red-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-[#CBCBD4] rounded-xl px-4 py-2">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-[#18206F]/50" />

            <input
              type="text"
              placeholder="Search uploads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#CBCBD4] rounded-lg pl-10 pr-4 py-3"
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter />

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-[#CBCBD4] rounded-lg px-4 py-3"
            >
              <option value="ALL">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border border-[#CBCBD4] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#CBCBD4]">
          <h2 className="font-semibold text-xl">Recent Uploads</h2>
          <button
            onClick={() => navigate("/company/upload-history")}
            className="text-sm font-semibold text-[#18206F] hover:text-[#D4AF37]"
          >
            View all in Upload History →
          </button>
        </div>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#18206F]/5 text-[#18206F]/70">
            <tr>
              <th className="px-4 py-3">Upload</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  Loading uploads...
                </td>
              </tr>
            ) : filteredUploads.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  No uploads found
                </td>
              </tr>
            ) : (
              filteredUploads.map((upload) => (
                <tr key={upload.id} className="border-t border-[#CBCBD4]">
                  <td className="px-4 py-3 font-semibold">{upload.title}</td>

                  <td className="px-4 py-3">{upload.complianceScore ?? "-"}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        upload.riskLevel === "High"
                          ? "bg-red-500/20 text-red-600"
                          : upload.riskLevel === "Medium"
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-green-500/20 text-green-600"
                      }`}
                    >
                      {upload.riskLevel || "Low"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {(upload.complianceScore || 0) >= 80 ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <FaCheckCircle />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-yellow-600">
                        <FaExclamationTriangle />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
