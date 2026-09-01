import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { CHART_COLORS, hasChartData, tooltipStyle } from "./chartUtils";

export default function MonthlyUploadChart({ data = [] }) {
  return (
    <ChartShell title="Monthly Compliance Count">
      {!hasChartData(data) ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="36%">
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
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8FAFF" }} />
            <Bar
              dataKey="uploads"
              name="Compliances"
              fill={CHART_COLORS.purple}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
