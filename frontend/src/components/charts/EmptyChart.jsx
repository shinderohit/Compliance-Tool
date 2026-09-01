export default function EmptyChart({ message = "No chart data available yet." }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-[18px] bg-[#F8FAFF] text-sm font-medium text-[#8B91B2]">
      {message}
    </div>
  );
}
