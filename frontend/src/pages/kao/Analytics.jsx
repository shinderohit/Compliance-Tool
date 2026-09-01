import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    clients: 5,
  },

  {
    month: "Feb",
    clients: 8,
  },

  {
    month: "Mar",
    clients: 15,
  },

  {
    month: "Apr",
    clients: 22,
  },
];

export default function Analytics() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">KAO Analytics</h1>

      <div className="bg-white border border-[#CBCBD4] rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line dataKey="clients" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
