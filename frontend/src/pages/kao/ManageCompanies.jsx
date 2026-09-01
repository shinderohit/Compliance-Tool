import { useEffect, useState } from "react";
import { FaBuilding } from "react-icons/fa";

import API from "../../api/axios";

import DataTable from "../../components/tables/DataTable";
import CompanyViewModal from "../../components/modals/CompanyViewModal";
import CompanyEditModal from "../../components/modals/CompanyEditModal";
import CompanyDocumentsModal from "../../components/modals/CompanyDocumentsModal";
import CompanyAnalyticsModal from "../../components/modals/CompanyAnalyticsModal";
import { companyOnboardingColumns } from "../../data/onboardingFlow";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await API.get("/kao/companies");

      setCompanies(res.data.companies || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleView = (company) => {
    setSelectedCompany(company);
    setViewOpen(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setEditOpen(true);
  };

  const columns = [
    ...companyOnboardingColumns,
    {
      key: "role",
      label: "Role",
      accessor: () => "COMPANY",
      sortable: true,
      filterOptions: ["All", "COMPANY"],
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => row.status || ((row.isActive ?? row.user?.isActive) ? "Active" : "Inactive"),
      sortable: true,
      filterOptions: ["All", "Active", "Pending", "Inactive"],
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FaBuilding />
            Manage Companies
          </h1>

          <p className="text-[#18206F]/60 mt-2 text-lg">
            Search, filter, sort, and manage all companies.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search company/branch..."
        onView={handleView}
        onEdit={handleEdit}
      />

      <CompanyViewModal
        open={viewOpen}
        company={selectedCompany}
        onClose={() => setViewOpen(false)}
      />

      <CompanyEditModal
        open={editOpen}
        company={selectedCompany}
        onClose={() => setEditOpen(false)}
        refresh={fetchCompanies}
      />

      <CompanyDocumentsModal
        open={docsOpen}
        company={selectedCompany}
        onClose={() => setDocsOpen(false)}
      />

      <CompanyAnalyticsModal
        open={analyticsOpen}
        company={selectedCompany}
        onClose={() => setAnalyticsOpen(false)}
      />
    </div>
  );
}
