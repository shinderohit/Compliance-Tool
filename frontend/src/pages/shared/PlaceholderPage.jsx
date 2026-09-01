export default function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-3xl text-[#18206F]/60">{description}</p>
      </div>
      <div className="rounded-lg border border-[#CBCBD4] bg-white p-6">
        <p className="text-sm font-semibold text-[#18206F]">
          This module is placed in the role flow and ready for API wiring.
        </p>
      </div>
    </div>
  );
}
