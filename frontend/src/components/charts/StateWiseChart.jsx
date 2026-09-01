import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import {
  CHART_COLORS,
  STATUS_COLORS,
  hasChartData,
  tooltipStyle,
} from "./chartUtils";

export default function StateWiseChart({ data = [] }) {
  return (
    <ChartShell title="State-wise Compliance Status">
      {!hasChartData(data) ? (
        <EmptyChart message="Add state data to companies to see this chart." />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barCategoryGap="54%">
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="state"
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
            <Legend iconType="circle" />
            <Bar
              dataKey="completed"
              stackId="status"
              name="Completed"
              fill={STATUS_COLORS.Completed}
            />
            <Bar
              dataKey="pending"
              stackId="status"
              name="Pending"
              fill={STATUS_COLORS.Pending}
            />
            <Bar
              dataKey="overdue"
              stackId="status"
              name="Overdue"
              fill={STATUS_COLORS.Overdue}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
