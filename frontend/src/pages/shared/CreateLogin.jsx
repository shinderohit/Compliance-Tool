import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const allowedRoles = {
  SUPER_ADMIN: [
    { label: "KAO", value: "KAO" },
    { label: "Client", value: "CLIENT" },
    { label: "Company/Branch", value: "COMPANY" },
  ],
  KAO: [
    { label: "Client", value: "CLIENT" },
    { label: "Company/Branch", value: "COMPANY" },
  ],
  CLIENT: [{ label: "Company/Branch", value: "COMPANY" }],
};

export default function CreateLogin() {
  const { user } = useAuth();
  const roles = useMemo(() => allowedRoles[user?.role] || [], [user?.role]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    role: roles[0]?.value || "",
    kaoId: "",
    clientId: "",
  });
  const [kaos, setKaos] = useState([]);
  const [clients, setClients] = useState([]);
  const [createdLogin, setCreatedLogin] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      role: roles[0]?.value || "",
      kaoId: "",
      clientId: "",
    }));
  }, [roles]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (user?.role === "SUPER_ADMIN") {
          const [kaoRes, clientRes] = await Promise.all([
            API.get("/super-admin/kaos", { params: { limit: 100 } }),
            API.get("/super-admin/clients", { params: { limit: 100 } }),
          ]);
          setKaos(kaoRes.data?.data || []);
          setClients(clientRes.data?.data || []);
        } else if (user?.role === "KAO") {
          const res = await API.get("/kao/clients", { params: { limit: 100 } });
          setClients(res.data?.clients || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchOptions();
  }, [user?.role]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setCreatedLogin(null);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        contactNumber: form.contactNumber,
        role: form.role,
        ...(form.kaoId ? { kaoId: form.kaoId } : {}),
        ...(form.clientId ? { clientId: form.clientId } : {}),
      };
      const res = await API.post("/auth/create-login", payload);
      setCreatedLogin(res.data?.data);
      setForm({
        name: "",
        email: "",
        password: "",
        contactNumber: "",
        role: roles[0]?.value || "",
        kaoId: "",
        clientId: "",
      });
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Create login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Login</h1>
        <p className="mt-2 text-[#18206F]/60">
          Create a pending portal login with role-based access. Super Admin
          approval activates the account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 md:grid-cols-2"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email ID"
          required
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Temporary Password"
          required
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          name="contactNumber"
          value={form.contactNumber}
          onChange={handleChange}
          placeholder="Contact Number"
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        {user?.role === "SUPER_ADMIN" && form.role === "CLIENT" && (
          <select
            name="kaoId"
            value={form.kaoId}
            onChange={handleChange}
            required
            className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
          >
            <option value="">Select KAO</option>
            {kaos.map((kao) => (
              <option key={kao.id} value={kao.id}>
                {kao.name}
              </option>
            ))}
          </select>
        )}

        {form.role === "COMPANY" && user?.role !== "CLIENT" && (
          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            required
            className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}

        <button
          disabled={loading}
          className="rounded-lg bg-[#18206F] p-3 font-bold text-white disabled:opacity-60 md:col-span-2"
        >
          {loading ? "Creating..." : "Create Login"}
        </button>
      </form>

      {createdLogin && (
        <section className="rounded-lg border border-green-600 bg-white p-5">
          <p className="font-semibold text-green-700">
            Login created for {createdLogin.name}
          </p>
          <p className="mt-2 text-sm">Email: {createdLogin.email}</p>
          <p className="text-sm">Password: {createdLogin.temporaryPassword}</p>
          <a
            href={createdLogin.loginUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-semibold text-blue-700 hover:underline"
          >
            {createdLogin.loginUrl}
          </a>
        </section>
      )}
    </div>
  );
}
