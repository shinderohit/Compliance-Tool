import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import API from "../../api/axios";

const riskStyles = {
  High: { color: "text-red-600", icon: FaExclamationTriangle, label: "High Risk" },
  Medium: { color: "text-yellow-600", icon: FaExclamationTriangle, label: "Medium Risk" },
  Low: { color: "text-green-600", icon: FaCheckCircle, label: "Low Risk" },
};

export default function AIInsights() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/compliance/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const summaryCards = analytics
    ? [
        {
          title: "High Risk Uploads",
          level: `${analytics.highRisk} document${analytics.highRisk === 1 ? "" : "s"}`,
          color: "text-red-600",
        },
        {
          title: "Medium Risk Uploads",
          level: `${analytics.mediumRisk} document${analytics.mediumRisk === 1 ? "" : "s"}`,
          color: "text-yellow-600",
        },
        {
          title: "Average Compliance Score",
          level: `${analytics.averageScore || 0}%`,
          color:
            (analytics.averageScore || 0) >= 80
              ? "text-green-600"
              : (analytics.averageScore || 0) >= 50
                ? "text-yellow-600"
                : "text-red-600",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">AI Insights</h1>
      <p className="text-[#18206F]/60 mb-8">
        Automated risk flags generated from your uploaded compliance
        documents.
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[#18206F]/60">Analyzing your compliance data...</div>
      ) : !analytics || analytics.totalUploads === 0 ? (
        <div className="bg-white border border-[#CBCBD4] rounded-2xl p-8 text-center text-[#18206F]/60">
          No uploads yet. Upload a compliance file to generate AI insights.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {summaryCards.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-[#CBCBD4] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-2 text-[#18206F]/70">
                  {item.title}
                </h2>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.level}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#CBCBD4] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Document Flags</h2>

            {analytics.recentIssues?.length === 0 ? (
              <p className="text-[#18206F]/60">No flagged issues found.</p>
            ) : (
              <div className="space-y-4">
                {analytics.recentIssues.map((upload) => {
                  const style = riskStyles[upload.riskLevel] || riskStyles.Low;
                  const Icon = style.icon;

                  return (
                    <div
                      key={upload.id}
                      className="border border-[#CBCBD4] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{upload.title}</p>
                        <span
                          className={`flex items-center gap-2 text-sm font-semibold ${style.color}`}
                        >
                          <Icon />
                          {style.label}
                        </span>
                      </div>

                      {upload.issues?.length > 0 ? (
                        <ul className="text-sm text-[#18206F]/70 space-y-1 mt-2">
                          {upload.issues.slice(0, 3).map((issue, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <FaInfoCircle className="mt-0.5 text-[#18206F]/40 shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <FaCheckCircle /> No issues detected
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
