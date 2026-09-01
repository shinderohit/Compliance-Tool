import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";

import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import { companyOnboardingColumns } from "../../data/onboardingFlow";

export default function CompaniesTable() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await API.get("/super-admin/companies");
      setCompanies(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleEdit = (row) => {
    navigate(`/super-admin/manage-company/${row.id}`);
  };

  const handleView = (row) => {
    if (row.loginUrl) {
      window.open(row.loginUrl, "_blank", "noopener,noreferrer");
      return;
    }
    alert(`Company/Branch details:\nName: ${row.name}\nEmail: ${row.email}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete company/branch "${row.name}"?`)) return;
    try {
      await API.delete(`/super-admin/companies/${row.id}`);
      fetchCompanies();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete company/branch");
    }
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
      accessor: (row) => ((row.isActive ?? row.user?.isActive) ? "Active" : "Inactive"),
      sortable: true,
      filterOptions: ["All", "Active", "Inactive"],
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
            Search, sort, filter and manage company records.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search companies..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
