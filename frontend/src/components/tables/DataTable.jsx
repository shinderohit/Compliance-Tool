import { useCallback, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FaChevronDown,
  FaChevronUp,
  FaFileExcel,
  FaFilePdf,
  FaEdit,
  FaEye,
  FaSearch,
  FaTrash,
} from "react-icons/fa";

export default function DataTable({
  columns,
  data,
  loading,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20],
  searchPlaceholder = "Search...",
  exportFileName = "table-data",
  onView,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.reduce((acc, column) => ({ ...acc, [column.key]: true }), {}),
  );

  const shownColumns = useMemo(
    () => columns.filter((column) => visibleColumns[column.key] !== false),
    [columns, visibleColumns],
  );

  const getRawCellValue = useCallback((column, row) => {
    if (typeof column.accessor === "function") return column.accessor(row);
    return row[column.key];
  }, []);

  const getCellValue = useCallback(
    (column, row) => {
      if (column.render) return column.render(row);
      return getRawCellValue(column, row);
    },
    [getRawCellValue],
  );

  const getSortableValue = useCallback(
    (column, row) => {
      if (typeof column.sortValue === "function") return column.sortValue(row);
      return getRawCellValue(column, row);
    },
    [getRawCellValue],
  );

  const filterableColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          Array.isArray(column.filterOptions) &&
          column.filterOptions.length > 0,
      ),
    [columns],
  );

  const filteredData = useMemo(() => {
    return data
      .filter((row) => {
        if (!search) return true;

        const term = search.toLowerCase();
        return columns.some((column) => {
          const value = getRawCellValue(column, row);
          return String(value ?? "")
            .toLowerCase()
            .includes(term);
        });
      })
      .filter((row) => {
        return filterableColumns.every((column) => {
          const value = getRawCellValue(column, row);
          const filterValue = activeFilters[column.key];
          if (!filterValue || filterValue === "All") return true;
          return String(value ?? "") === String(filterValue);
        });
      });
  }, [
    data,
    search,
    activeFilters,
    columns,
    filterableColumns,
    getRawCellValue,
  ]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getSortableValue(column, a);
      const bValue = getSortableValue(column, b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue ?? "").localeCompare(String(bValue ?? ""))
        : String(bValue ?? "").localeCompare(String(aValue ?? ""));
    });
  }, [filteredData, sortKey, sortDirection, columns, getSortableValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / currentPageSize),
  );

  const effectivePage = Math.min(page, totalPages);

  const pageData = sortedData.slice(
    (effectivePage - 1) * currentPageSize,
    effectivePage * currentPageSize,
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? (
      <FaChevronUp className="inline-block ml-2" />
    ) : (
      <FaChevronDown className="inline-block ml-2" />
    );
  };

  const getExportValue = (column, row) => {
    const value = getRawCellValue(column, row);
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const exportRows = sortedData.map((row) =>
    shownColumns.reduce((record, column) => {
      record[column.label] = getExportValue(column, row);
      return record;
    }, {}),
  );

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [shownColumns.map((column) => column.label)],
      body: sortedData.map((row) =>
        shownColumns.map((column) => getExportValue(column, row)),
      ),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [24, 32, 111] },
    });
    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#D9DCE8] bg-white/85 px-3 py-2.5 shadow-sm">
            <FaSearch className="text-[#18206F]/60" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[#18206F] outline-none placeholder:text-[#18206F]/40"
            />
          </div>

          {(filterableColumns.length > 0 || columns.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {filterableColumns.map((column) => (
                <div key={column.key} className="min-w-[160px]">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#18206F]/60">
                    {column.label}
                  </label>
                  <select
                    value={activeFilters[column.key] || "All"}
                    onChange={(e) => {
                      setActiveFilters((current) => ({
                        ...current,
                        [column.key]: e.target.value,
                      }));
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-[#D9DCE8] bg-white px-3 py-2.5 text-[#18206F] outline-none focus:border-[#D4AF37]"
                  >
                    {column.filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="min-w-[220px]">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#18206F]/60">
                  Columns
                </label>
                <div className="rounded-xl border border-[#D9DCE8] bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="inline-flex items-center gap-2 text-xs text-[#18206F]/75"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key] !== false}
                          onChange={(event) =>
                            setVisibleColumns((current) => ({
                              ...current,
                              [column.key]: event.target.checked,
                            }))
                          }
                        />
                        {column.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportExcel}
            disabled={shownColumns.length === 0 || sortedData.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:opacity-40"
          >
            <FaFileExcel />
            Excel
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={shownColumns.length === 0 || sortedData.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-40"
          >
            <FaFilePdf />
            PDF
          </button>
          <div className="rounded-xl border border-[#D9DCE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#18206F]/65 shadow-sm">
            {sortedData.length} result{sortedData.length === 1 ? "" : "s"}
          </div>

          <div className="rounded-xl border border-[#D9DCE8] bg-white px-4 py-2.5 shadow-sm">
            <label className="mr-2 text-sm text-[#18206F]/60">Rows:</label>
            <select
              value={currentPageSize}
              onChange={(e) => {
                setCurrentPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-[#D9DCE8] bg-white px-3 py-2 outline-none focus:border-[#D4AF37]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-[#D9DCE8] bg-white shadow-[0_18px_45px_rgba(24,32,111,0.08)]">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-[#18206F] text-white">
            <tr>
              {shownColumns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3.5 font-semibold"
                  onClick={() =>
                    column.sortable !== false && toggleSort(column.key)
                  }
                >
                  <div className="flex cursor-pointer items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-4 py-3.5 font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    shownColumns.length + (onView || onEdit || onDelete ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  Loading...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    shownColumns.length + (onView || onEdit || onDelete ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-[#18206F]/60"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr
                  key={
                    row.id ||
                    row._id ||
                    row.name ||
                    `${effectivePage}-${rowIndex}`
                  }
                  className="border-t border-[#E4E7EF] odd:bg-white even:bg-[#F9FAFC] transition-colors hover:bg-[#F3EEC8]/30"
                >
                  {shownColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3.5 align-top text-[#18206F]/82"
                    >
                      {getCellValue(column, row)}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-4 py-3.5 align-top">
                      <div className="inline-flex items-center gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="rounded-lg bg-[#18206F]/5 p-2 text-[#18206F]/70 transition hover:bg-[#D4AF37]/15 hover:text-[#18206F]"
                            title="View"
                          >
                            <FaEye />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="rounded-lg bg-[#18206F] p-2 text-white transition hover:bg-[#18206F]/80"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 text-sm font-medium text-[#18206F]/60 shadow-sm">
        <span>
          Showing {pageData.length} of {sortedData.length} result
          {sortedData.length === 1 ? "" : "s"}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={effectivePage <= 1}
            className="rounded-lg border border-[#D9DCE8] bg-white px-3 py-2 disabled:opacity-40"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span>
            Page {effectivePage} of {totalPages}
          </span>
          <button
            disabled={effectivePage >= totalPages}
            className="rounded-lg border border-[#D9DCE8] bg-white px-3 py-2 disabled:opacity-40"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
