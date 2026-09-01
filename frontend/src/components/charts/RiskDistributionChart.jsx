import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { RISK_COLORS, hasChartData, tooltipStyle } from "./chartUtils";

export default function RiskDistributionChart({ data = [] }) {
  const filteredData = data.filter((item) => item.name !== "Medium");

  const sunburstData = filteredData.flatMap((item) => {
    const value = Number(item.value) || 0;
    const reviewed = Math.round(value * 0.5);
    const open = Math.max(0, value - reviewed);

    return [
      { name: `${item.name} Reviewed`, value: reviewed, parent: item.name },
      { name: `${item.name} Open`, value: open, parent: item.name },
    ];
  });

  return (
    <ChartShell title="Risk Distribution">
      {!hasChartData(data) ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="value"
              nameKey="name"
              innerRadius={32}
              outerRadius={56}
              paddingAngle={2}
            >
              {filteredData.map((entry) => (
                <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
              ))}
            </Pie>
            <Pie
              data={sunburstData}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={95}
              paddingAngle={1}
            >
              {sunburstData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={RISK_COLORS[entry.parent]}
                  opacity={entry.name.includes("Open") ? 0.45 : 0.85}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
