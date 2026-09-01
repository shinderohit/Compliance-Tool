import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ProfilePage({ title = "Profile" }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", contactNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/auth/profile");
        const nextProfile = res.data?.profile;
        setProfile(nextProfile);
        setForm({
          name: nextProfile?.name || "",
          contactNumber: nextProfile?.contactNumber || "",
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const res = await API.patch("/auth/profile", form);
      setProfile((current) => ({ ...current, ...res.data?.profile }));
      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#CBCBD4] bg-white p-8 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-[#18206F]/60">
          Basic login and contact details for this portal account.
        </p>
      </div>

      <section className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 md:grid-cols-2">
        <Info label="Role" value={profile?.role} />
        <Info label="Email ID" value={profile?.email} />
        <Info label="Login Password" value={profile?.temporaryPassword || "-"} />
        <Info
          label="System ID"
          value={
            profile?.entity?.kaoCode ||
            profile?.entity?.clientCode ||
            profile?.entity?.companyCode ||
            profile?.id
          }
        />
      </section>

      <form
        onSubmit={updateProfile}
        className="grid gap-4 rounded-lg border border-[#CBCBD4] bg-white p-6 md:grid-cols-2"
      >
        <input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Name"
          required
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <input
          value={form.contactNumber}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              contactNumber: event.target.value,
            }))
          }
          placeholder="Contact Number"
          className="rounded-lg bg-[#18206F]/5 p-3 outline-none"
        />
        <button
          disabled={saving}
          className="rounded-lg bg-[#18206F] p-3 font-bold text-white disabled:opacity-60 md:col-span-2"
        >
          {saving ? "Updating..." : "Update Contact Details"}
        </button>
      </form>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-[#18206F]/5 p-4">
      <p className="text-xs font-semibold uppercase text-[#18206F]/50">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold">{value || "-"}</p>
    </div>
  );
}

