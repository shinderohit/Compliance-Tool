import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { CHART_COLORS, tooltipStyle } from "./chartUtils";

export default function ComplianceTrendChart({ data = [] }) {
  const chartData = (Array.isArray(data) ? data : []).map((item, index) => ({
    month: item.month || item.label || item.name || `M${index + 1}`,
    uploads:
      Number(
        item.uploads ?? item.count ?? item.total ?? item.compliances ?? 0,
      ) || 0,
    averageScore:
      Number(item.averageScore ?? item.score ?? item.value ?? 0) || 0,
  }));

  const hasData = chartData.some(
    (item) => Number(item.uploads) > 0 || Number(item.averageScore) > 0,
  );

  return (
    <ChartShell title="Compliance Trend Over Time">
      {!hasData ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="uploads"
              name="Compliances"
              stroke={CHART_COLORS.purple}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.purple, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: CHART_COLORS.red, strokeWidth: 0 }}
            />
            <Scatter
              dataKey="uploads"
              name="Trend points"
              fill={CHART_COLORS.purple}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
