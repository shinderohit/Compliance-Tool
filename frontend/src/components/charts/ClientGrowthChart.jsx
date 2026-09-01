import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { CHART_COLORS, hasChartData, tooltipStyle } from "./chartUtils";

export default function ClientGrowthChart({ data = [] }) {
  const chartData = (Array.isArray(data) ? data : []).map((item) => ({
    area:
      item.area || item.department || item.lawArea || item.name || "Unassigned",
    completed: Number(item.completed) || 0,
    pending: Number(item.pending) || 0,
  }));

  return (
    <ChartShell title="Compliance by Law Area">
      {!hasChartData(chartData) ? (
        <EmptyChart message="Add law-area data to see this chart." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="area"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke={CHART_COLORS.mint}
              fill={CHART_COLORS.mint}
              fillOpacity={0.25}
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke={CHART_COLORS.yellow}
              fill={CHART_COLORS.yellow}
              fillOpacity={0.18}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
