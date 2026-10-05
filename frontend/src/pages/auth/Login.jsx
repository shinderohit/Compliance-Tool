import { useState } from "react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.jpg";
import Logo from "../../assets/Logo.png";
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
    <div className="login-page">
      <div className="login-shell">
        <aside className="login-brand">
          <div className=" bg-white/10 text-white border-white/10 flex items-center justify-center p-0">
            <img
              src={logo}
              alt="ViMATE logo"
              className="h-18 w-auto object-contain"
            />
          </div>
          <h2>AI Compliance SaaS</h2>
          <p>
            {mode === "login"
              ? "Secure enterprise platform for role-based compliance operations across teams, branches, and approvals."
              : "Reset your password and get back to compliance management securely."}
          </p>

          <div className="login-points">
            <span>Role-based access</span>
            <span>Smart workflow</span>
            <span>Audit visibility</span>
          </div>
        </aside>

        <div className="login-form-wrap">
          <form
            onSubmit={mode === "login" ? handleLogin : handleForgotPassword}
            className="login-form"
          >
            <div className="mb-6">
              <div className="brand-badge mb-4">
                <img
                  src={Logo}
                  alt="ViMATE logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <h1>{mode === "login" ? "Welcome back" : "Reset password"}</h1>
              <p className="mt-2">
                {mode === "login"
                  ? "Secure enterprise platform for role-based compliance operations."
                  : "Reset your password with your registered email."}
              </p>
            </div>

            <div className="form-stack">
              <input
                type="email"
                placeholder="Enter Email"
                value={form.email}
                className="form-field"
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
                  className="form-field"
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
                    className="form-field"
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
                    className="form-field"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>

            <button disabled={loading} className="login-button mt-6">
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Resetting..."
                : mode === "login"
                  ? "Login"
                  : "Reset Password"}
            </button>

            {message && (
              <p className="mt-4 text-sm font-medium text-emerald-600">
                {message}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between text-sm text-[#18206F]/65">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="font-semibold text-[#18206F] hover:text-[#D4AF37]"
                >
                  Forgot password?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="font-semibold text-[#18206F] hover:text-[#D4AF37]"
                >
                  Back to login
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
