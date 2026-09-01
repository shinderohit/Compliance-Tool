import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";
import { useAuth } from "../../context/AuthContext";
import { employeeExcelFields } from "../../data/onboardingFlow";

export default function ManageEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const endpoint =
          user?.role === "CLIENT" ? "/client/employees" : "/company/employees";
        const res = await API.get(endpoint);
        setEmployees(res.data?.employees || []);
      } catch (error) {
        console.error(error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user?.role]);

  const employeeAccessors = {
    "Emp ID": (row) => row.employeeCode,
    "Client ID": (row) => row.company?.clientId,
    "Branch ID": (row) => row.branch?.code || row.branchId,
    "Full Name of Employees": (row) => row.name,
    Mobile: (row) => row.phone,
    "Company Name": (row) => row.company?.name,
    "Department Name": (row) => row.department?.name,
    Designation: (row) => row.designation?.name,
  };

  const columns = employeeExcelFields.map((field) => ({
    key: field,
    label: field,
    accessor: (row) => employeeAccessors[field]?.(row) || row[field] || "-",
    sortable: true,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <FaUsers />
            Manage Employee
          </h1>
          <p className="mt-2 text-[#18206F]/60">
            Employee count: {employees.length}. Search, sort, filter, and choose
            visible columns from the employee data table.
          </p>
        </div>
        <div className="rounded-lg border border-[#CBCBD4] bg-white px-4 py-3 font-bold">
          {employees.length} Employees
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search employees..."
      />
    </div>
  );
}
