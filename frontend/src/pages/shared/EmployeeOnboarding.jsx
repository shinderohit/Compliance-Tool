import { Upload } from "lucide-react";
import { employeeExcelFields } from "../../data/onboardingFlow";

export default function EmployeeOnboarding({ title = "Onboarding Employee" }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-3xl text-[#18206F]/60">
          Capture employee master data manually or upload an Excel/CSV file with
          the configured employee columns.
        </p>
      </div>
      <form className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 md:grid-cols-2">
        {employeeExcelFields.map((field) => (
          <input
            key={field}
            placeholder={field}
            className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
          />
        ))}
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-[#18206F]/5 p-3 text-[#18206F]/70 md:col-span-2">
          <Upload size={18} />
          <span>Upload employee Excel / CSV</span>
          <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" />
        </label>
        <button
          type="button"
          className="rounded-lg bg-[#18206F] p-3 font-bold text-white md:col-span-2"
        >
          Submit for Approval
        </button>
      </form>
    </div>
  );
}
