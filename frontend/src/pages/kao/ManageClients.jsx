import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";

import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import { clientOnboardingColumns } from "../../data/onboardingFlow";

export default function ManageClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/kao/clients");
      setClients(res.data.clients || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = async (client) => {
    const updatedName = window.prompt("Edit client name:", client.name);
    if (!updatedName || updatedName === client.name) return;

    try {
      const res = await API.patch(`/kao/clients/${client.id}`, {
        name: updatedName,
      });
      const updatedClient = res.data?.client;

      setClients((current) =>
        current.map((item) =>
          item.id === client.id ? { ...item, ...updatedClient } : item,
        ),
      );
      alert("Client updated successfully");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Client update failed");
    }
  };

  const handleView = (client) => {
    alert(`Client details:\nName: ${client.name}\nEmail: ${client.email}`);
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
            Search, filter, sort, and manage all clients.
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
      />
    </div>
  );
}
