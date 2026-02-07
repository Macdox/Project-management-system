import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";
import useStore from "../../services/Stores";
import {
  fetchProjects,
  assignDeveloper,
  uploadProjectDocument,
} from "../../services/Api";

function Lead() {
  const { user } = useStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [assigningId, setAssigningId] = useState(null);
  const [developerInputs, setDeveloperInputs] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
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

  const handleAssign = async (projectId) => {
    const email = developerInputs[projectId]?.trim();
    if (!email) {
      setStatus({ type: "warning", message: "Enter developer email" });
      return;
    }
    setAssigningId(projectId);
    setStatus({ type: "", message: "" });
    try {
      await assignDeveloper(projectId, email);
      setStatus({ type: "success", message: "Developer assigned" });
      setDeveloperInputs((prev) => ({ ...prev, [projectId]: "" }));
      loadProjects();
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Assign failed" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    try {
      await uploadProjectDocument(id, file);
      setStatus({ type: "success", message: "Document uploaded" });
      loadProjects();
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Upload failed" });
    } finally {
      setUploadingId(null);
    }
  };

  const toggleDocs = (id) => {
    setOpenDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">Lead Dashboard</h5>
            <p className="text-muted mb-0">
              Projects you lead. Assign developers and manage documents. {user?.email ? `Signed in as ${user.email}.` : ""}
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
                    <th>Deadline</th>
                    <th>Developers</th>
                    <th>Assign Developer</th>
                    <th>Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.status}</td>
                      <td>{p.deadline ? p.deadline.substring(0, 10) : "-"}</td>
                      <td>
                        {p.developers && p.developers.length > 0 ? (
                          <div className="d-flex flex-column gap-1">
                            {p.developers.map((dev) => (
                              <span key={dev._id || dev} className="badge bg-light text-dark border">
                                {dev.email || dev}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="dev@example.com"
                            value={developerInputs[p._id] || ""}
                            onChange={(e) =>
                              setDeveloperInputs((prev) => ({ ...prev, [p._id]: e.target.value }))
                            }
                          />
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAssign(p._id)}
                            disabled={assigningId === p._id}
                          >
                            {assigningId === p._id ? "Assigning..." : "Assign"}
                          </button>
                        </div>
                      </td>
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
                        <div className="mt-2">
                          <label className="btn btn-sm btn-outline-secondary mb-0">
                            {uploadingId === p._id ? "Uploading..." : "Upload"}
                            <input
                              type="file"
                              hidden
                              onChange={(e) => handleUpload(p._id, e.target.files?.[0])}
                            />
                          </label>
                        </div>
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

export default Lead;