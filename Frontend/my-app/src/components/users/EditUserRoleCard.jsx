import { useState } from "react";

const EditUserRoleCard = ({ onUpdate }) => {
  const [form, setForm] = useState({ email: "", role: "DEVELOPER" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      await onUpdate(form);
      setStatus({ type: "success", message: "Role updated" });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Update role failed";
      setStatus({ type: "danger", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h6 className="card-title">Edit User Role</h6>
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label">User Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">New Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">Admin</option>
              <option value="LEAD">Lead</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-secondary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
        {status.message && (
          <div className={`alert alert-${status.type} mt-3 mb-0`} role="alert">
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUserRoleCard;
