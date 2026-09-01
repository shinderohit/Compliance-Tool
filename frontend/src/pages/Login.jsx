import { useState } from "react";

import API from "../api/axios";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);

      login(res.data);

      const role = res.data.user.role;

      if (role === "SUPER_ADMIN") {
        navigate("/super-admin");
      }

      if (role === "KAO") {
        navigate("/kao");
      }

      if (role === "CLIENT") {
        navigate("/client");
      }

      if (role === "COMPANY") {
        navigate("/company");
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Data not found");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CBCBD4]/20">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl w-[400px] shadow-2xl border border-[#CBCBD4]"
      >
        <h1 className="text-3xl font-bold mb-6">AI Compliance SaaS</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-[#18206F]/5"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-[#18206F]/5"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button className="w-full bg-[#18206F] text-white p-3 rounded-xl">Login</button>
      </form>
    </div>
  );
}
