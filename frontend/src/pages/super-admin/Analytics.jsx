import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "KAOs",
    value: 10,
  },

  {
    name: "Clients",
    value: 35,
  },

  {
    name: "Companies",
    value: 100,
  },
];

export default function Analytics() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Super Admin Analytics</h1>

      <div className="bg-white border border-[#CBCBD4] rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={150} />

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
