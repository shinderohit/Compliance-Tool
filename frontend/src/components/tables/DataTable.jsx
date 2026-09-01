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

  const getCellValue = useCallback((column, row) => {
    if (column.render) return column.render(row);
    return getRawCellValue(column, row);
  }, [getRawCellValue]);

  const getSortableValue = useCallback((column, row) => {
    if (typeof column.sortValue === "function") return column.sortValue(row);
    return getRawCellValue(column, row);
  }, [getRawCellValue]);

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
          <div className="flex items-center gap-3 rounded-xl bg-white border border-[#CBCBD4] px-2 py-2">
            <FaSearch className="text-[#18206F]/60" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent outline-none"
            />
          </div>

          {(filterableColumns.length > 0 || columns.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {filterableColumns.map((column) => (
                <div key={column.key} className="min-w-[160px]">
                  <label className="block text-sm text-[#18206F]/60 mb-2">
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
                    className="w-full rounded-xl bg-white border border-[#CBCBD4] px-2 py-2 outline-none"
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
                <label className="block text-sm text-[#18206F]/60 mb-2">
                  Columns
                </label>
                <div className="rounded-xl bg-white border border-[#CBCBD4] px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="inline-flex items-center gap-2 text-xs"
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportExcel}
            disabled={shownColumns.length === 0 || sortedData.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CBCBD4] bg-white px-4 py-3 font-semibold text-[#18206F] disabled:opacity-40"
          >
            <FaFileExcel />
            Excel
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={shownColumns.length === 0 || sortedData.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CBCBD4] bg-white px-4 py-3 font-semibold text-[#18206F] disabled:opacity-40"
          >
            <FaFilePdf />
            PDF
          </button>
          <div className="rounded-xl bg-white border border-[#CBCBD4] px-4 py-3 text-sm text-[#18206F]/60">
            {sortedData.length} result{sortedData.length === 1 ? "" : "s"}
          </div>

          <div className="rounded-xl bg-white border border-[#CBCBD4] px-4 py-3">
            <label className="text-[#18206F]/60 text-sm mr-2">Rows:</label>
            <select
              value={currentPageSize}
              onChange={(e) => {
                setCurrentPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg bg-white border border-[#CBCBD4] px-3 py-2 outline-none"
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

      <div className="overflow-x-auto rounded-2xl border border-[#CBCBD4] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#18206F]/5 text-[#18206F]/70">
            <tr>
              {shownColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-2 py-2 font-semibold"
                  onClick={() =>
                    column.sortable !== false && toggleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    {column.label}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-2 py-2 font-semibold">Actions</th>
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
                  className="px-2 py-2 text-center text-[#18206F]/60"
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
                  className="px-2 py-2 text-center text-[#18206F]/60"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || row.name || `${effectivePage}-${rowIndex}`}
                  className="border-t border-[#CBCBD4] hover:bg-[#18206F]/5 transition-colors"
                >
                  {shownColumns.map((column) => (
                    <td key={column.key} className="px-2 py-2 align-top">
                      {getCellValue(column, row)}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-2 py-2 align-top">
                      <div className="inline-flex items-center gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="rounded-lg bg-[#18206F]/5 p-2 text-[#18206F]/70 hover:bg-[#D4AF37]/15 hover:text-[#18206F]"
                            title="View"
                          >
                            <FaEye />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="rounded-lg bg-[#18206F] p-2 text-white hover:bg-[#18206F]/80"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#CBCBD4] px-4 py-3 text-sm text-[#18206F]/60">
        <span>
          Showing {pageData.length} of {sortedData.length} result
          {sortedData.length === 1 ? "" : "s"}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={effectivePage <= 1}
            className="rounded-lg border border-[#CBCBD4] bg-white px-3 py-2 disabled:opacity-40"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span>
            Page {effectivePage} of {totalPages}
          </span>
          <button
            disabled={effectivePage >= totalPages}
            className="rounded-lg border border-[#CBCBD4] bg-white px-3 py-2 disabled:opacity-40"
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
