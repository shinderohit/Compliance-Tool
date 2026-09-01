import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import ActionButtons from "../../components/ActionButtons";
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function TenantTablePage({
  title,
  endpoint,
  resource,
  columns,
}) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setLoading(true);

        const res = await API.get(endpoint, {
          params: {
            search,
            page,
            limit: 10,
          },
        });

        setRows(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, [endpoint, page, search]);

  const handleAction = (event) => {
    if (event.action === "toggle") {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === event.id ? { ...row, ...event.payload } : row,
        ),
      );
    }

    if (event.action === "delete") {
      setRows((currentRows) =>
        currentRows.filter((row) => row.id !== event.id),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-[#18206F]/60">Search and review tenant data.</p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-lg border border-[#CBCBD4] bg-white px-4 py-3 md:w-96">
          <Search size={18} className="text-[#18206F]/60" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#CBCBD4] bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[#18206F]/5 text-[#18206F]/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">URL</th>
              <th className="px-4 py-3 font-semibold">Manage</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#CBCBD4]">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {row.loginUrl ? (
                      <a
                        href={row.loginUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        {row.loginUrl}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-[#18206F]/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      row={row}
                      resource={resource}
                      onDone={handleAction}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((currentPage) => currentPage - 1)}
          className="rounded-lg border border-[#CBCBD4] p-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-[#18206F]/60">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((currentPage) => currentPage + 1)}
          className="rounded-lg border border-[#CBCBD4] p-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
