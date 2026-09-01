import { useEffect, useState } from "react";
import { FaBuilding } from "react-icons/fa";

import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import { companyOnboardingColumns } from "../../data/onboardingFlow";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await API.get("/client/companies");
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

  const handleEdit = (company) => {
    const updatedName = window.prompt("Edit company name:", company.name);
    if (!updatedName || updatedName === company.name) return;

    setCompanies((current) =>
      current.map((item) =>
        item.id === company.id ? { ...item, name: updatedName } : item,
      ),
    );
    alert("Company name updated locally.");
  };

  const handleView = (company) => {
    alert(
      `Company/Branch details:\nName: ${company.name}\nEmail: ${company.email}\nGST: ${company.gst}\nPAN: ${company.pan}`,
    );
  };

  const getCompanyLoginUrl = (company) =>
    company.loginUrl || (company.slug ? `/company/${company.slug}/login` : "");

  const columns = [
    ...companyOnboardingColumns,
    {
      key: "loginUrl",
      label: "Login Link",
      accessor: getCompanyLoginUrl,
      render: (row) => {
        const loginUrl = getCompanyLoginUrl(row);

        if (!loginUrl) return "-";

        return (
          <a
            href={loginUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            {loginUrl}
          </a>
        );
      },
      sortable: true,
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

          <p className="text-[#18206F]/60 mt-2   text-lg">
            Search, sort, filter, and manage company records.
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
      />
    </div>
  );
}
