import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "KAOs",
    total: 12,
  },

  {
    name: "Clients",
    total: 45,
  },

  {
    name: "Companies",
    total: 122,
  },

  {
    name: "Uploads",
    total: 800,
  },
];

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Super Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl">
          <h2>Total KAOs</h2>

          <p className="text-4xl font-bold mt-3">12</p>
        </div>

        <div className="bg-white p-6 rounded-2xl">
          <h2>Total Clients</h2>

          <p className="text-4xl font-bold mt-3">45</p>
        </div>

        <div className="bg-white p-6 rounded-2xl">
          <h2>Total Companies</h2>

          <p className="text-4xl font-bold mt-3">122</p>
        </div>

        <div className="bg-white p-6 rounded-2xl">
          <h2>Total Uploads</h2>

          <p className="text-4xl font-bold mt-3">800</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
