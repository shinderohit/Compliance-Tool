export default function AnalyticsCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#CBCBD4] shadow-lg">
      <h3 className="text-[#18206F]/60 text-sm mb-2">{title}</h3>

      <h1 className="text-3xl font-bold">{value}</h1>
    </div>
  );
}
