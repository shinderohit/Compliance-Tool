import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";

import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import { clientOnboardingColumns } from "../../data/onboardingFlow";

export default function ClientsTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/super-admin/clients");
      setClients(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (row) => {
    navigate(`/super-admin/manage-client/${row.id}`);
  };

  const handleView = (row) => {
    if (row.loginUrl) {
      window.open(row.loginUrl, "_blank", "noopener,noreferrer");
      return;
    }
    alert(`Client details:\nName: ${row.name}\nEmail: ${row.email}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete client "${row.name}"?`)) return;
    try {
      await API.delete(`/super-admin/clients/${row.id}`);
      fetchClients();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete client");
    }
  };

  const columns = [
    ...clientOnboardingColumns,
    {
      key: "role",
      label: "Role",
      accessor: () => "CLIENT",
      sortable: true,
      filterOptions: ["All", "CLIENT"],
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
            <FaUsers />
            Manage Clients
          </h1>
          <p className="text-[#18206F]/60 mt-2 text-lg">
            Search, sort, filter, and manage client records.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search clients..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
