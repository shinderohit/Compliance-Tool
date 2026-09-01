import ChartShell from "./ChartShell";
import EmptyChart from "./EmptyChart";
import { CHART_COLORS, hasChartData } from "./chartUtils";

function toBoxData(data) {
  return data.map((item) => {
    const values = [
      Number(item.pending) || 0,
      Number(item.completed) || 0,
      Number(item.overdue) || 0,
      Number(item.highRisk) || 0,
      Number(item.mediumRisk) || 0,
      Number(item.lowRisk) || 0,
    ].sort((a, b) => a - b);

    return {
      department: item.department,
      min: values[0],
      q1: values[1],
      median: values[2],
      q3: values[4],
      max: values[5],
    };
  });
}

export default function DepartmentPerformanceChart({ data = [] }) {
  const boxData = toBoxData(data);
  const maxValue = Math.max(...boxData.map((item) => item.max), 1);
  const width = 720;
  const height = 320;
  const left = 126;
  const right = 28;
  const top = 28;
  const rowHeight = 42;
  const scale = (value) =>
    left + (Number(value || 0) / maxValue) * (width - left - right);

  return (
    <ChartShell title="Department-wise Pending Compliances">
      {!hasChartData(data) ? (
        <EmptyChart />
      ) : (
        <div className="h-[320px] overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full min-w-[680px] text-[#8B91B2]"
            role="img"
            aria-label="Department-wise compliance box plot"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = left + ratio * (width - left - right);
              return (
                <g key={ratio}>
                  <line
                    x1={x}
                    y1={top - 8}
                    x2={x}
                    y2={height - 26}
                    stroke={CHART_COLORS.grid}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill={CHART_COLORS.muted}
                  >
                    {Math.round(maxValue * ratio)}
                  </text>
                </g>
              );
            })}

            {boxData.slice(0, 6).map((item, index) => {
              const y = top + index * rowHeight + 18;
              const q1 = scale(item.q1);
              const q3 = scale(item.q3);
              const median = scale(item.median);

              return (
                <g key={item.department}>
                  <text
                    x={left - 14}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill={CHART_COLORS.muted}
                  >
                    {item.department}
                  </text>
                  <line
                    x1={scale(item.min)}
                    y1={y}
                    x2={scale(item.max)}
                    y2={y}
                    stroke={CHART_COLORS.purple}
                    strokeWidth="2"
                  />
                  <line
                    x1={scale(item.min)}
                    y1={y - 8}
                    x2={scale(item.min)}
                    y2={y + 8}
                    stroke={CHART_COLORS.purple}
                    strokeWidth="2"
                  />
                  <line
                    x1={scale(item.max)}
                    y1={y - 8}
                    x2={scale(item.max)}
                    y2={y + 8}
                    stroke={CHART_COLORS.purple}
                    strokeWidth="2"
                  />
                  <rect
                    x={q1}
                    y={y - 12}
                    width={Math.max(q3 - q1, 8)}
                    height="24"
                    rx="6"
                    fill={CHART_COLORS.mint}
                    opacity="0.72"
                  />
                  <line
                    x1={median}
                    y1={y - 14}
                    x2={median}
                    y2={y + 14}
                    stroke={CHART_COLORS.ink}
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </ChartShell>
  );
}
