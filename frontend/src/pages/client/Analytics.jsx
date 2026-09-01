import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    companies: 3,
  },

  {
    month: "Feb",
    companies: 8,
  },

  {
    month: "Mar",
    companies: 15,
  },

  {
    month: "Apr",
    companies: 25,
  },
];

export default function Analytics() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Client Analytics</h1>

      <div className="bg-white border border-[#CBCBD4] rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Area dataKey="companies" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
