import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import ChartShell from "./ChartShell";
import { CHART_COLORS } from "./chartUtils";

export default function ScoreTrendChart({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <ChartShell title="Overall Compliance Score">
      <div className="relative h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="92%"
            barSize={18}
            data={[{ name: "Score", value: safeScore }]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={16}
              background={{ fill: "#EEF1F8" }}
              fill={CHART_COLORS.purple}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#1F2559]">{safeScore}%</p>
            <p className="mt-1 text-sm text-[#8B91B2]">AI score</p>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}
