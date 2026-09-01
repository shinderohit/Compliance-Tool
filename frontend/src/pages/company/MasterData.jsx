import { useEffect, useState } from "react";
import API from "../../api/axios";

const masterTypes = [
  ["companies", "Company/Branch"],
  ["industries", "Industry"],
  ["business-types", "Business Type"],
  ["departments", "Department"],
  ["designations", "Designation"],
  ["frequencies", "Compliance Frequency"],
  ["authorities", "Authority"],
  ["regulatory-bodies", "Regulatory Body"],
  ["holiday-calendars", "Holiday Calendar"],
];

export default function MasterData() {
  const [activeType, setActiveType] = useState("industries");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [complianceRows, setComplianceRows] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const activeLabel = masterTypes.find(([key]) => key === activeType)?.[1];
  const isHolidayCalendar = activeType === "holiday-calendars";
  const isCompanyType = activeType === "companies";

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/master/${activeType}`);
      setRows(res.data || []);
    } catch (error) {
      console.log(error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    API.get(`/master/${activeType}`)
      .then((res) => {
        if (isMounted) setRows(res.data || []);
      })
      .catch((error) => {
        console.log(error);
        if (isMounted) setRows([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeType]);

  useEffect(() => {
    if (!isHolidayCalendar) return;

    let isMounted = true;

    API.get("/compliance/master")
      .then((res) => {
        if (isMounted) setComplianceRows(res.data?.compliances || []);
      })
      .catch((error) => {
        console.log(error);
        if (isMounted) setComplianceRows([]);
      });

    return () => {
      isMounted = false;
    };
  }, [isHolidayCalendar]);

  const createRow = async (event) => {
    event.preventDefault();

    if (isCompanyType) {
      return;
    }

    const payload =
      activeType === "holiday-calendars"
        ? {
            name: form.name,
            year: Number(form.code) || new Date().getFullYear(),
          }
        : activeType === "frequencies"
          ? {
              name: form.name,
              code: form.code,
              days: Number(form.description) || 0,
            }
          : form;

    await API.post(`/master/${activeType}`, payload);
    setForm({ name: "", code: "", description: "" });
    fetchRows();
  };

  const formatDateKey = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const calendarMonthLabel = calendarDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const selectedCalendar = rows.find((row) => row.year === calendarYear);
  const holidaysByDate = (selectedCalendar?.holidays || []).reduce(
    (acc, holiday) => {
      const key = formatDateKey(holiday.date);
      if (!key) return acc;
      acc[key] = [...(acc[key] || []), holiday];
      return acc;
    },
    {},
  );

  const complianceByDate = complianceRows.reduce((acc, item) => {
    [
      ["Due", item.dueDate],
      ["Expiry", item.expiryDate],
    ].forEach(([type, value]) => {
      const key = formatDateKey(value);
      if (!key) return;
      acc[key] = [
        ...(acc[key] || []),
        {
          id: `${item.id}-${type}`,
          type,
          title: item.compliance || item.complianceType || "Compliance",
          risk: item.effectiveRisk || item.risk || "Unknown",
          status: item.effectiveStatus || item.status || "Pending",
        },
      ];
    });

    return acc;
  }, {});

  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const leadingBlankDays = firstDay.getDay();
  const calendarCells = [
    ...Array.from({ length: leadingBlankDays }, (_, index) => ({
      key: `blank-${index}`,
      blank: true,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(calendarYear, calendarMonth, day);
      const key = formatDateKey(date);

      return {
        key,
        day,
        holidays: holidaysByDate[key] || [],
        compliances: complianceByDate[key] || [],
      };
    }),
  ];

  const changeCalendarMonth = (offset) => {
    setCalendarDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p className="mt-2 text-[#18206F]/60">
          Manage industry, business type, department, designation, branch
          support data, frequency, authority, regulatory body, and holiday
          calendars.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {masterTypes.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveType(key)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              activeType === key
                ? "bg-[#18206F] text-white"
                : "bg-white text-[#18206F]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isCompanyType ? (
        <form
          onSubmit={createRow}
          className="rounded-xl border border-[#CBCBD4] bg-white p-5"
        >
          <h2 className="mb-4 text-xl font-bold">Add {activeLabel}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-lg border border-[#CBCBD4] px-3 py-2"
              required
            />
            <input
              placeholder={activeType === "holiday-calendars" ? "Year" : "Code"}
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, code: event.target.value }))
              }
              className="rounded-lg border border-[#CBCBD4] px-3 py-2"
            />
            {activeType !== "holiday-calendars" && (
              <input
                placeholder={
                  activeType === "frequencies" ? "Days" : "Description"
                }
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="rounded-lg border border-[#CBCBD4] px-3 py-2"
              />
            )}
          </div>
          <button className="mt-4 rounded-lg bg-[#18206F] px-5 py-2 font-bold text-white">
            Save
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-5 text-sm text-[#92400E]">
          <p className="font-semibold">
            Company/Branch master data is read-only here.
          </p>
          <p className="mt-2">
            Company/Branch records are managed through company creation flows in
            the client and super-admin sections.
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[#CBCBD4] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#18206F]/5">
            <tr>
              {isCompanyType ? (
                <>
                  <th className="px-4 py-3">Company/Branch</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Business Type</th>
                  <th className="px-4 py-3">Slug</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code / Year</th>
                  <th className="px-4 py-3">Description</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={isCompanyType ? "6" : "3"}
                  className="px-4 py-8 text-center"
                >
                  Loading master data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={isCompanyType ? "6" : "3"}
                  className="px-4 py-8 text-center"
                >
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#CBCBD4]">
                  {isCompanyType ? (
                    <>
                      <td className="px-4 py-3 font-semibold">{row.name}</td>
                      <td className="px-4 py-3">{row.email || "-"}</td>
                      <td className="px-4 py-3">{row.client?.name || "-"}</td>
                      <td className="px-4 py-3">{row.industry?.name || "-"}</td>
                      <td className="px-4 py-3">
                        {row.businessType?.name || "-"}
                      </td>
                      <td className="px-4 py-3">{row.slug || "-"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.code || row.year || "-"}
                      </td>
                      <td className="px-4 py-3">{row.description || "-"}</td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {isHolidayCalendar && (
        <section className="space-y-4 rounded-xl border border-[#CBCBD4] bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Holiday Compliance Calendar</h2>
              <p className="mt-1 text-sm text-[#18206F]/60">
                Holidays, compliance due dates, and expiry dates for the
                selected month.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeCalendarMonth(-1)}
                className="rounded-lg border border-[#CBCBD4] px-3 py-2 text-sm font-semibold"
              >
                Previous
              </button>
              <div className="min-w-40 rounded-lg bg-[#18206F]/5 px-4 py-2 text-center font-semibold">
                {calendarMonthLabel}
              </div>
              <button
                type="button"
                onClick={() => changeCalendarMonth(1)}
                className="rounded-lg border border-[#CBCBD4] px-3 py-2 text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="rounded-lg bg-[#18206F]/5 px-2 py-2 text-center font-semibold text-[#18206F]/70"
              >
                {day}
              </div>
            ))}

            {calendarCells.map((cell) =>
              cell.blank ? (
                <div
                  key={cell.key}
                  className="min-h-32 rounded-lg bg-[#CBCBD4]/10"
                />
              ) : (
                <div
                  key={cell.key}
                  className="min-h-32 rounded-lg border border-[#CBCBD4] bg-white p-2"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-[#18206F]">{cell.day}</span>
                    {(cell.holidays.length > 0 ||
                      cell.compliances.length > 0) && (
                      <span className="rounded-full bg-[#18206F]/5 px-2 py-0.5 text-xs">
                        {cell.holidays.length + cell.compliances.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {cell.holidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                      >
                        Holiday: {holiday.name}
                      </div>
                    ))}

                    {cell.compliances.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-md px-2 py-1 text-xs ${
                          item.type === "Due"
                            ? "bg-yellow-50 text-yellow-800"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        <p className="font-semibold">
                          {item.type}: {item.title}
                        </p>
                        <p>
                          {item.status} | {item.risk}
                        </p>
                      </div>
                    ))}

                    {cell.compliances.length > 3 && (
                      <p className="text-xs text-[#18206F]/60">
                        +{cell.compliances.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
