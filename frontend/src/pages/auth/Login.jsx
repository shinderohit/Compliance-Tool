import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../../api/axios";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      login(res.data);

      const role = res.data.user.role;

      if (role === "SUPER_ADMIN") {
        navigate("/super-admin");
      } else if (role === "KAO") {
        navigate("/kao");
      } else if (role === "CLIENT") {
        navigate("/client");
      } else if (role === "COMPANY") {
        navigate("/company");
      }
    } catch (error) {
      console.log("Login failed:", error?.response?.data || error);

      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      return alert("Please fill in all fields to reset your password.");
    }

    if (form.newPassword !== form.confirmPassword) {
      return alert("New passwords do not match.");
    }

    try {
      setLoading(true);

      await API.post("/auth/forgot-password", {
        email: form.email,
        newPassword: form.newPassword,
      });

      setMessage("Password reset successful. You can now login.");
      setMode("login");
      setForm({
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = () => {
    setMessage("");
    setForm({ email: "", password: "", newPassword: "", confirmPassword: "" });
    setMode(mode === "login" ? "forgot" : "login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background min-h-screen text-primary">
      <form
        onSubmit={mode === "login" ? handleLogin : handleForgotPassword}
        className="bg-white p-10 rounded-2xl w-[400px] border border-[#CBCBD4] shadow-2xl"
      >
        <h1 className="text-3xl font-bold mb-2">AI Compliance SaaS</h1>

        <p className="text-[#18206F]/60 mb-8">
          {mode === "login"
            ? "Secure enterprise platform"
            : "Reset your password with your registered email."}
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          value={form.email}
          className="w-full p-4 mb-5 rounded-xl bg-[#18206F]/5 outline-none border border-[#CBCBD4]"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {mode === "login" ? (
          <input
            type="password"
            placeholder="Enter Password"
            value={form.password}
            className="w-full p-4 mb-6 rounded-xl bg-[#18206F]/5 outline-none border border-[#CBCBD4]"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />
        ) : (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={form.newPassword}
              className="w-full p-4 mb-5 rounded-xl bg-[#18206F]/5 outline-none border border-[#CBCBD4]"
              onChange={(e) =>
                setForm({
                  ...form,
                  newPassword: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              className="w-full p-4 mb-6 rounded-xl bg-[#18206F]/5 outline-none border border-[#CBCBD4]"
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
            />
          </>
        )}

        <button
          disabled={loading}
          className="w-full bg-[#18206F] text-white hover:bg-[#18206F]/85 transition-all duration-300 p-4 rounded-xl font-bold"
        >
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Resetting..."
            : mode === "login"
              ? "Login"
              : "Reset Password"}
        </button>

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}

        <div className="mt-6 flex justify-between items-center text-sm text-[#18206F]/60">
          {mode === "login" ? (
            <button
              type="button"
              onClick={handleModeToggle}
              className="text-[#18206F] font-semibold hover:text-[#D4AF37]"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={handleModeToggle}
              className="text-[#18206F] font-semibold hover:text-[#D4AF37]"
            >
              Back to login
            </button>
          )}
        </div>

        <div className="mt-6 text-sm text-[#18206F]/60">
          <p>Super Admin: admin@saas.com</p>
          <p>Password: Admin@123</p>
        </div>
      </form>
    </div>
  );
}
