export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-[#18206F]/60 text-sm">{title}</h2>
      <p className="text-4xl font-bold mt-3">{value}</p>
    </div>
  );
}
