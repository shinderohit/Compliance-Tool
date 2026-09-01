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
import {
  CHART_COLORS,
  STATUS_COLORS,
  hasChartData,
  tooltipStyle,
} from "./chartUtils";

export default function StatusDistributionChart({ data = [] }) {
  return (
    <ChartShell title="Completed vs Pending vs Overdue">
      {!hasChartData(data) ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={STATUS_COLORS.Completed}
                  stopOpacity={0.42}
                />
                <stop
                  offset="95%"
                  stopColor={STATUS_COLORS.Completed}
                  stopOpacity={0.06}
                />
              </linearGradient>
              <linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={STATUS_COLORS.Pending}
                  stopOpacity={0.42}
                />
                <stop
                  offset="95%"
                  stopColor={STATUS_COLORS.Pending}
                  stopOpacity={0.06}
                />
              </linearGradient>
              <linearGradient id="overdueFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={STATUS_COLORS.Overdue}
                  stopOpacity={0.42}
                />
                <stop
                  offset="95%"
                  stopColor={STATUS_COLORS.Overdue}
                  stopOpacity={0.06}
                />
              </linearGradient>
            </defs>
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
            <Legend iconType="circle" />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="status"
              name="Completed"
              stroke={STATUS_COLORS.Completed}
              fill="url(#completedFill)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stackId="status"
              name="Pending"
              stroke={STATUS_COLORS.Pending}
              fill="url(#pendingFill)"
            />
            <Area
              type="monotone"
              dataKey="overdue"
              stackId="status"
              name="Overdue"
              stroke={STATUS_COLORS.Overdue}
              fill="url(#overdueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
