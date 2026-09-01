import { CHART_COLORS } from "./chartUtils";

const tileStyles = [
  {
    bg: "bg-[#FFE1E9]",
    icon: "bg-[#FF4D6D]",
    ring: CHART_COLORS.red,
  },
  {
    bg: "bg-[#FFF3D8]",
    icon: "bg-[#FF8A65]",
    ring: CHART_COLORS.orange,
  },
  {
    bg: "bg-[#DCFCEB]",
    icon: "bg-[#3CD856]",
    ring: CHART_COLORS.green,
  },
  {
    bg: "bg-[#EFE2FF]",
    icon: "bg-[#A855F7]",
    ring: CHART_COLORS.violet,
  },
];

export default function UploadTrendChart({
  title,
  value = 0,
  total = 100,
  tone = 0,
}) {
  const safeTotal = Math.max(Number(total) || 0, 1);
  const percent = Math.round((Number(value || 0) / safeTotal) * 100);
  const style = tileStyles[tone % tileStyles.length];
  const histogramBars = [24, 42, 58, 76, 62, 84].map((bar, index) => ({
    id: index,
    value: bar,
  }));

  return (
    <div className={`rounded-[18px] ${style.bg} p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <span
            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${style.icon} text-sm font-bold text-white`}
          >
            {String(title).slice(0, 1)}
          </span>
          <p className="text-md font-semibold" style={{ color: style.ring }}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1F2559]">{value}</p>
        </div>
        <div>
          <div className="flex h-20 items-end gap-1">
            {histogramBars.map((bar) => (
              <div
                key={bar.id}
                className="w-2 rounded-t-sm"
                style={{
                  height: `${Math.max(10, bar.value)}px`,
                  backgroundColor: style.ring,
                }}
              />
            ))}
          </div>
          <div>
            <p className="mt-3 text-sm font-semibold text-[#1F2559]">
              {percent}% of target
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
