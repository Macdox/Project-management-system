import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";
import useStore from "../../services/Stores";
import { fetchProjects } from "../../services/Api";

function Developer() {
  const { user } = useStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [openDocs, setOpenDocs] = useState({});

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await fetchProjects();
      setProjects(data || []);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Failed to load projects" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const toggleDocs = (id) => {
    setOpenDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">Developer Dashboard</h5>
            <p className="text-muted mb-0">
              Projects assigned to you. {user?.email ? `Signed in as ${user.email}.` : ""}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type}`} role="alert">{status.message}</div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="card-title">Your Projects</h6>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span className="text-muted">Loading...</span>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-muted mb-0">No projects assigned to you yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Lead</th>
                    <th>Deadline</th>
                    <th>Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.status}</td>
                      <td>{p.lead?.email || "-"}</td>
                      <td>{p.deadline ? p.deadline.substring(0, 10) : "-"}</td>
                      <td>
                        {p.documents && p.documents.length > 0 ? (
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => toggleDocs(p._id)}
                            >
                              Docs ({p.documents.length})
                            </button>
                            {openDocs[p._id] && (
                              <div className="mt-2 border rounded p-2 bg-light">
                                <div className="d-flex flex-column gap-1">
                                  {p.documents.map((doc) => (
                                    <a
                                      key={doc.filename}
                                      href={`http://localhost:5000/uploads/${doc.filename}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {doc.originalName || doc.filename}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Developer;