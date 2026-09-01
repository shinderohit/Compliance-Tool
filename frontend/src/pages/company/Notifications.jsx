import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import DataTable from "../../components/tables/DataTable";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data?.notifications || []);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const markRead = async (row) => {
    if (row.isRead) return;

    try {
      await API.patch(`/notifications/${row.id}/read`);
      await fetchNotifications();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to mark notification");
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      await fetchNotifications();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to mark notifications");
    }
  };

  const columns = [
    {
      key: "state",
      label: "State",
      accessor: (row) => (row.isRead ? "Read" : "Unread"),
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            row.isRead
              ? "bg-[#CBCBD4]/30 text-[#18206F]/60 ring-[#CBCBD4]"
              : "bg-blue-50 text-blue-700 ring-blue-200"
          }`}
        >
          {row.isRead ? "Read" : "Unread"}
        </span>
      ),
      filterOptions: ["All", "Unread", "Read"],
      sortable: true,
    },
    { key: "type", label: "Type", accessor: (row) => row.type || "-", sortable: true },
    { key: "title", label: "Title", accessor: (row) => row.title || "-", sortable: true },
    {
      key: "message",
      label: "Message",
      accessor: (row) => row.message || "-",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      accessor: (row) => formatDate(row.createdAt),
      sortValue: (row) => new Date(row.createdAt || 0).getTime(),
      sortable: true,
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (row) =>
        row.isRead ? (
          "-"
        ) : (
          <button
            type="button"
            onClick={() => markRead(row)}
            className="rounded-lg bg-[#18206F] px-3 py-2 text-xs font-semibold text-white"
          >
            Mark Read
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-2 text-lg text-[#18206F]/60">
            Compliance reminders, approvals, imports, and system alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="rounded-lg bg-[#18206F] px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Mark all read ({unreadCount})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Search notifications..."
      />
    </div>
  );
}
