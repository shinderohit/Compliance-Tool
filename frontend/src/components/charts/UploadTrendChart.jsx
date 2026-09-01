import { CHART_COLORS } from "./chartUtils";

const tileStyles = [
  {
    bg: "bg-[#FDE8EE]",
    icon: "bg-[#FF4D6D]",
    ring: CHART_COLORS.red,
    accent: "#FF4D6D",
  },
  {
    bg: "bg-[#FFF4D9]",
    icon: "bg-[#FFB020]",
    ring: CHART_COLORS.orange,
    accent: "#FFB020",
  },
  {
    bg: "bg-[#EAFBF0]",
    icon: "bg-[#1DBF73]",
    ring: CHART_COLORS.green,
    accent: "#1DBF73",
  },
  {
    bg: "bg-[#F0E8FF]",
    icon: "bg-[#8B5CF6]",
    ring: CHART_COLORS.violet,
    accent: "#8B5CF6",
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
  const histogramBars = [26, 40, 58, 72, 68, 84].map((bar, index) => ({
    id: index,
    value: bar,
  }));

  return (
    <div
      className={`rounded-[22px] border border-white/70 ${style.bg} p-5 shadow-[0_16px_28px_rgba(24,32,111,0.08)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon} text-sm font-black text-white shadow-lg shadow-[#18206F]/10`}
          >
            {String(title).slice(0, 1)}
          </span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#18206F]/60">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black text-[#1F2559]">{value}</p>
        </div>

        <div className="flex flex-col items-end">
          <span
            className="mb-3 inline-flex rounded-full border border-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              color: style.accent,
            }}
          >
            {percent}%
          </span>
          <div className="flex h-20 items-end gap-1.5">
            {histogramBars.map((bar) => (
              <div
                key={bar.id}
                className="w-2 rounded-t-md"
                style={{
                  height: `${Math.max(12, bar.value)}px`,
                  background: `linear-gradient(180deg, ${style.accent}, ${style.ring})`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#18206F]/10 pt-3">
        <span className="text-xs font-semibold text-[#18206F]/65">Target</span>
        <span className="text-xs font-bold text-[#18206F]">{total}</span>
      </div>
    </div>
  );
}
