import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { CHART_COLORS, hasChartData, tooltipStyle } from "./chartUtils";

export default function CompanyGrowthChart({ data = [] }) {
  const latest = data[data.length - 1] || {};
  const rawValue =
    latest.progress || latest.averageScore || latest.companies || 0;
  const progress = Math.max(0, Math.min(100, Number(rawValue) || 0));
  const chartData = [
    { name: "Progress", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];

  return (
    <ChartShell title="Company/Branch Compliance Progress">
      {!hasChartData(data) ? (
        <EmptyChart />
      ) : (
        <div className="relative h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="72%"
                innerRadius={76}
                outerRadius={110}
                startAngle={180}
                endAngle={0}
                paddingAngle={2}
              >
                <Cell fill={CHART_COLORS.mint} />
                <Cell fill="#EEF1F8" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-8 text-center">
            <p className="text-4xl font-bold text-[#1F2559]">{progress}%</p>
            <p className="mt-1 text-sm text-[#8B91B2]">
              Gauge Chart - {latest.month || "Current"}
            </p>
          </div>
        </div>
      )}
    </ChartShell>
  );
}
