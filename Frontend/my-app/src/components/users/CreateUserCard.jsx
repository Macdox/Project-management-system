import { useState } from "react";

const CreateUserCard = ({ onCreate }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "DEVELOPER" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      await onCreate(form);
      setStatus({ type: "success", message: "User created" });
      setForm({ name: "", email: "", password: "", role: "DEVELOPER" });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Create user failed";
      setStatus({ type: "danger", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h6 className="card-title">Create User</h6>
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Role</label>
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
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
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

export default CreateUserCard;
