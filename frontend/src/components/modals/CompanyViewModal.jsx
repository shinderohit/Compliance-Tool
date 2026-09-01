import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function CompanyViewModal({ open, company, onClose }) {
  const [companyData, setCompanyData] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);

        const res = await API.get(`/company/${company.id}`);

        setCompanyData(res.data.company);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (open && company?.id) {
      fetchCompanyDetails();
    }
  }, [open, company]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[700px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Company/Branch Details</h2>

          <button onClick={onClose} className="bg-red-600 px-3 py-1 rounded">
            X
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#18206F]/60">Company/Branch Name</p>

                <p>{companyData?.name}</p>
              </div>

              <div>
                <p className="text-[#18206F]/60">Email</p>

                <p>{companyData?.email}</p>
              </div>

              <div>
                <p className="text-[#18206F]/60">Slug</p>

                <p>{companyData?.slug}</p>
              </div>

              <div>
                <p className="text-[#18206F]/60">Client</p>

                <p>{companyData?.client?.name}</p>
              </div>

              <div>
                <p className="text-[#18206F]/60">Total Uploads</p>

                <p>{companyData?.uploads?.length || 0}</p>
              </div>

              <div>
                <p className="text-[#18206F]/60">Created Date</p>

                <p>{new Date(companyData?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
