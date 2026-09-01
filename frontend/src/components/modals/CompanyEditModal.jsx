import { useState } from "react";
import API from "../../api/axios";

export default function CompanyEditModal({ open, company, onClose, refresh }) {
  const [name, setName] = useState(company?.name || "");

  if (!open || !company) return null;

  const updateCompany = async () => {
    try {
      await API.put(`/company/${company.id}`, {
        name,
      });

      refresh();

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[500px]">
        <h2 className="text-2xl font-bold mb-5">Edit Company</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#18206F]/5 p-3 rounded"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={updateCompany}
            className="bg-[#18206F] text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
