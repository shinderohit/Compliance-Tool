import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  {
    month: "Jan",
    uploads: 400,
  },

  {
    month: "Feb",
    uploads: 700,
  },

  {
    month: "Mar",
    uploads: 1200,
  },

  {
    month: "Apr",
    uploads: 1800,
  },
];

export default function AnalyticsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 h-[400px]">
      <h2 className="text-2xl mb-6">Upload Analytics</h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area type="monotone" dataKey="uploads" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
