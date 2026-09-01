export default function CompanyAnalyticsModal({ open, company, onClose }) {
  if (!open || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[700px]">
        <h2 className="text-2xl font-bold mb-6">AI Analytics</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#18206F]/5 p-5 rounded">
            <h3>Total Uploads</h3>
            <p className="text-3xl font-bold">{company.uploads?.length || 0}</p>
          </div>

          <div className="bg-[#18206F]/5 p-5 rounded">
            <h3>Compliance Score</h3>
            <p className="text-3xl font-bold text-green-600">92%</p>
          </div>

          <div className="bg-[#18206F]/5 p-5 rounded">
            <h3>Risk Level</h3>
            <p className="text-3xl font-bold text-red-600">Medium</p>
          </div>
        </div>

        <button onClick={onClose} className="mt-6 bg-red-600 px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
