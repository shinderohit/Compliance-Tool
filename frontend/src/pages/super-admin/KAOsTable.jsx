import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";

import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";

export default function KAOsTable() {
  const [kaos, setKaos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchKaos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/super-admin/kaos");
      setKaos(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaos();
  }, []);

  const handleEdit = (row) => {
    navigate(`/super-admin/manage-kaos/${row.id}`);
  };

  const handleView = (row) => {
    if (row.loginUrl) {
      window.open(row.loginUrl, "_blank", "noopener,noreferrer");
      return;
    }
    alert(`KAO details:\nName: ${row.name}\nEmail: ${row.email}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete KAO "${row.name}"?`)) return;
    try {
      await API.delete(`/super-admin/kaos/${row.id}`);
      fetchKaos();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete KAO");
    }
  };

  const columns = [
    { key: "kaoCode", label: "KAO ID", sortable: true },
    { key: "name", label: "KAO", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "totalClients", label: "Clients", sortable: true },
    { key: "totalCompanies", label: "Companies", sortable: true },
    { key: "totalEmployees", label: "Employees", sortable: true },
    {
      key: "role",
      label: "Role",
      accessor: () => "KAO",
      sortable: true,
      filterOptions: ["All", "KAO"],
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => (row.isActive ? "Active" : "Inactive"),
      sortable: true,
      filterOptions: ["All", "Active", "Inactive"],
    },
    {
      key: "approvalStatus",
      label: "Approval",
      sortable: true,
      filterOptions: ["All", "PENDING", "APPROVED", "REJECTED"],
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FaUsers />
            Manage KAOs
          </h1>
          <p className="text-[#18206F]/60 mt-2 text-lg">
            Search, sort, filter, and manage KAOs.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={kaos}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search KAOs..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
