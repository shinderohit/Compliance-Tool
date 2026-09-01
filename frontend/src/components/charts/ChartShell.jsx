export default function ChartShell({ title, children, className = "" }) {
  return (
    <div className={`rounded-[22px] p-5 ${className}`}>
      <h2 className="mb-4 text-lg font-bold text-[#1F2559]">{title}</h2>
      {children}
    </div>
  );
}
